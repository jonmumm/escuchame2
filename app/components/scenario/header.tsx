import { Button } from "~/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface HeaderProps {
  scenarioDetails: {
    type: 'template' | 'custom' | 'lucky';
    title?: string;
    description?: string;
    prompt?: string;
    nativeLanguage: string;
    targetLanguage: string;
  };
  onBack: () => void;
}

export function Header({ scenarioDetails, onBack }: HeaderProps) {
  return (
    <header className="p-4 border-b dark:border-gray-800">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="flex-1">
            {scenarioDetails.type === 'template' ? (
              <>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {scenarioDetails.title}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {scenarioDetails.description}
                </p>
              </>
            ) : scenarioDetails.type === 'lucky' ? (
              <>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Random Conversation
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Let's practice something unexpected
                </p>
              </>
            ) : (
              <>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Custom Practice
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {scenarioDetails.prompt}
                </p>
              </>
            )}
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span>{scenarioDetails.nativeLanguage}</span>
              <span>→</span>
              <span>{scenarioDetails.targetLanguage}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 