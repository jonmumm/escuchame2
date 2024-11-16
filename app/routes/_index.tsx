import { catchError } from "@jonmumm/utils/catchError";
import { useStore } from "@nanostores/react";
import type { MetaFunction } from "@remix-run/cloudflare";
import { useNavigate } from "@remix-run/react";
import { ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast, Toaster } from "sonner";
import { Drawer } from "vaul";
import { LanguageSelector } from "~/components/homepage/language-selector";
import { ScenarioTemplateCard } from "~/components/homepage/scenario-template-card";
import { TemplatesDrawer } from "~/components/homepage/templates-drawer";
import { Button } from "~/components/ui/button";
import { UserContext } from "~/user.context";
import { createHomepageStores, type HomepageStores } from "../components/homepage/homepage.stores";
import { languages, initialSuggestions, extraSuggestions } from "../components/homepage/homepage.constants";

// Types
export type ScenarioTemplate = {
  title: string;
  description: string;
  icon: string;
};

export type ScenarioSelection = {
  type: "template" | "custom" | "lucky";
  template?: ScenarioTemplate;
  customPrompt?: string;
  nativeLanguage: string;
  targetLanguage: string;
};

export const meta: MetaFunction = () => {
  return [{ title: "Escuchame" }];
};

// Add this with other store functions
export function selectLucky(stores: HomepageStores) {
  stores.scenarioSelection$.set({
    ...stores.scenarioSelection$.get(),
    type: "lucky",
    template: undefined,
    customPrompt: undefined,
  });
}

export default function Homepage() {
  const [stores] = useState(createHomepageStores());
  const client = UserContext.useClient();
  const navigate = useNavigate();
  const send = UserContext.useSend();

  // Handler functions that need access to stores/navigation
  const handleStartConversation = async () => {
    const selection = stores.scenarioSelection$.get();
    const customPrompt = stores.customPrompt$.get();
    
    if (selection.type === "custom" && !customPrompt.trim()) return;

    stores.isStarting$.set(true);

    const scenarioId = crypto.randomUUID();

    const payload = {
      id: scenarioId,
      type: selection.type,
      nativeLanguage: selection.nativeLanguage,
      targetLanguage: selection.targetLanguage,
      prompt:
        selection.type === "custom"
          ? customPrompt
          : selection.type === "template"
          ? `Practice ${selection.template?.title.toLowerCase()}: ${
              selection.template?.description
            }`
          : "random",
      timestamp: new Date().toISOString(),
    };

    send({
      type: "CREATE_SCENARIO",
      scenarioId: scenarioId,
      payload,
    });

    const [error] = await catchError(
      client.waitFor(
        (state) => state.public.scenarioIds.includes(scenarioId),
        5000
      )
    );

    if (error) {
      console.error("Failed to create scenario:", error);
      stores.isStarting$.set(false);
      toast.error("Failed to create conversation", {
        description: "Please try again in a few moments",
        action: {
          label: "Retry",
          onClick: () => handleStartConversation(),
        },
      });
      return;
    }

    navigate(`/scenario/${scenarioId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 dark:from-gray-900 dark:to-gray-800">
      <Toaster richColors position="top-center" />
      <div className="mx-auto max-w-2xl space-y-8 pt-8">
        <Header />
        <LanguageSelectors stores={stores} />
        <ConversationSelector 
          stores={stores} 
          onStartConversation={handleStartConversation} 
        />
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Start a Conversation
      </h2>
      <p className="mt-2 text-gray-600 dark:text-gray-300">
        Choose your languages and describe what you'd like to practice
      </p>
    </div>
  );
}

function LanguageSelectors({ stores }: { stores: HomepageStores }) {
  const handleLanguageChange = (
    type: "native" | "target",
    lang: (typeof languages)[0]
  ) => {
    stores.scenarioSelection$.setKey(
      type === "native" ? "nativeLanguage" : "targetLanguage",
      lang.code
    );
  };

  const selection = useStore(stores.scenarioSelection$);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <LanguageSelector
        label="I speak"
        languages={languages}
        selectedCode={selection.nativeLanguage}
        onChange={(lang) => handleLanguageChange("native", lang)}
      />
      <LanguageSelector
        label="I want to practice"
        languages={languages}
        selectedCode={selection.targetLanguage}
        onChange={(lang) => handleLanguageChange("target", lang)}
      />
    </div>
  );
}

function ConversationSelector({ 
  stores,
  onStartConversation 
}: { 
  stores: HomepageStores;
  onStartConversation: () => void;
}) {
  const selection = useStore(stores.scenarioSelection$);
  const selectedExtra = useStore(stores.selectedExtraTemplate$);
  const customPrompt = useStore(stores.customPrompt$);
  const showMoreTemplates = useStore(stores.showMoreTemplates$);
  const isStarting = useStore(stores.isStarting$);

  const handleSuggestionClick = (suggestion: ScenarioTemplate, isExtra: boolean = false) => {
    stores.scenarioSelection$.set({
      ...stores.scenarioSelection$.get(),
      type: "template",
      template: suggestion,
      customPrompt: undefined,
    });

    if (isExtra) {
      stores.selectedExtraTemplate$.set(suggestion);
    }
  };

  const handleCustomPromptChange = (text: string) => {
    stores.customPrompt$.set(text);
    if (text.trim()) {
      stores.scenarioSelection$.set({
        ...stores.scenarioSelection$.get(),
        type: "custom",
        customPrompt: text,
        template: undefined,
      });
    }
  };

  const handleLuckyClick = () => {
    selectLucky(stores);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        What would you like to practice?
      </label>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Templates */}
        <TemplatesColumn 
          stores={stores}
          selection={selection}
          selectedExtra={selectedExtra}
          showMoreTemplates={showMoreTemplates}
          onSuggestionClick={handleSuggestionClick}
        />

        {/* Right Column: Custom Input and Lucky */}
        <CustomInputColumn 
          customPrompt={customPrompt}
          selection={selection}
          onCustomPromptChange={handleCustomPromptChange}
          onLuckyClick={handleLuckyClick}
        />
      </div>

      <StartButton 
        isStarting={isStarting}
        selection={selection}
        customPrompt={customPrompt}
        onStart={onStartConversation}
      />
    </div>
  );
}

function TemplatesColumn({
  stores,
  selection,
  selectedExtra,
  showMoreTemplates,
  onSuggestionClick,
}: {
  stores: HomepageStores;
  selection: ScenarioSelection;
  selectedExtra: ScenarioTemplate | null;
  showMoreTemplates: boolean;
  onSuggestionClick: (template: ScenarioTemplate, isExtra: boolean) => void;
}) {
  const handleExtraTemplateSelect = (template: ScenarioTemplate) => {
    onSuggestionClick(template, true);
    stores.showMoreTemplates$.set(false); // Close the drawer after selection
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
        Choose a template
      </h3>
      <div className="space-y-2">
        {initialSuggestions.map((suggestion) => (
          <ScenarioTemplateCard
            key={suggestion.title}
            {...suggestion}
            isSelected={
              selection.type === "template" &&
              selection.template?.title === suggestion.title
            }
            onClick={() => onSuggestionClick(suggestion, false)}
          />
        ))}

        {selectedExtra && (
          <ScenarioTemplateCard
            {...selectedExtra}
            isSelected={
              selection.type === "template" &&
              selection.template?.title === selectedExtra.title
            }
            onClick={() => onSuggestionClick(selectedExtra, true)}
          />
        )}

        <Drawer.Root
          open={showMoreTemplates}
          onOpenChange={(open) => stores.showMoreTemplates$.set(open)}
        >
          <Drawer.Trigger asChild>
            <button
              type="button"
              data-testid="more-templates-button"
              className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700
                hover:border-blue-500 dark:hover:border-blue-400
                transition-all duration-200 hover:shadow-md
                focus:outline-none focus:ring-2 focus:ring-blue-500
                bg-gray-50 dark:bg-gray-800/50"
            >
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium">More templates</span>
              </div>
            </button>
          </Drawer.Trigger>

          <Drawer.Portal>
            <Drawer.Content
              data-testid="templates-drawer"
              className="fixed bottom-0 left-0 right-0 mt-24 flex h-[96%] flex-col rounded-t-[10px] bg-white dark:bg-gray-900"
            >
              <TemplatesDrawer
                isOpen={showMoreTemplates}
                onOpenChange={(open) => stores.showMoreTemplates$.set(open)}
                templates={extraSuggestions}
                selectedTemplate={
                  selection.type === "template" ? selection.template : undefined
                }
                onTemplateSelect={handleExtraTemplateSelect}
              />
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    </div>
  );
}

function CustomInputColumn({
  customPrompt,
  selection,
  onCustomPromptChange,
  onLuckyClick,
}: {
  customPrompt: string;
  selection: ScenarioSelection;
  onCustomPromptChange: (text: string) => void;
  onLuckyClick: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Custom Input */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Describe your own
        </h3>
        <textarea
          value={customPrompt}
          onChange={(e) => onCustomPromptChange(e.target.value)}
          placeholder="Example: I want to practice discussing my favorite hobbies..."
          className={`w-full min-h-[160px] rounded-lg border p-4 
            text-gray-900 dark:text-gray-100
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            focus:border-blue-500 focus:ring-2 focus:ring-blue-500
            ${
              selection.type === "custom"
                ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/50"
                : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            }`}
          rows={4}
        />
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
            or
          </span>
        </div>
      </div>

      {/* Get Lucky Button */}
      <button
        onClick={onLuckyClick}
        className={`w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700
          hover:border-blue-500 dark:hover:border-blue-400
          transition-all duration-200 hover:shadow-md hover:scale-[1.02]
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${
            selection.type === "lucky"
              ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/50"
              : "bg-white dark:bg-gray-800"
          }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎲</span>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Get Lucky
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Let us choose a random conversation for you
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}

function StartButton({
  isStarting,
  selection,
  customPrompt,
  onStart,
}: {
  isStarting: boolean;
  selection: ScenarioSelection;
  customPrompt: string;
  onStart: () => void;
}) {
  const buttonText = isStarting ? "Starting..." : "Start Conversation";
  const ariaLabel = isStarting ? "Starting conversation..." : "Start conversation";
  
  return (
    <Button
      className="w-full py-6 text-lg mt-8"
      onClick={onStart}
      disabled={
        !selection.type ||
        (selection.type === "custom" && !customPrompt.trim()) ||
        isStarting
      }
      aria-label={ariaLabel}
    >
      {isStarting ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{buttonText}</span>
        </div>
      ) : (
        buttonText
      )}
    </Button>
  );
}
