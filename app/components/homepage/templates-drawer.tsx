import { Drawer } from "vaul";
import type { ScenarioTemplate } from "~/routes/_index";

interface TemplatesDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  templates: ScenarioTemplate[];
  selectedTemplate?: ScenarioTemplate;
  onTemplateSelect: (template: ScenarioTemplate) => void;
}

export function TemplatesDrawer({
  isOpen,
  onOpenChange,
  templates,
  selectedTemplate,
  onTemplateSelect,
}: TemplatesDrawerProps) {
  return (
    <div className="flex-1 overflow-y-auto rounded-t-[10px] bg-gray-50 p-4 dark:bg-gray-800">
      <div className="mx-auto mb-8 h-1.5 w-12 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-700" />
      <div className="mx-auto max-w-md">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
          More Templates
        </h3>
        <div className="space-y-2">
          {templates.map((template) => (
            <button
              key={template.title}
              data-testid={`template-${template.title.toLowerCase().replace(/\s+/g, '-')}`}
              className={`w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700
                hover:border-blue-500 dark:hover:border-blue-400
                transition-all duration-200 hover:shadow-md hover:scale-[1.02]
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${
                  selectedTemplate?.title === template.title
                    ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/50"
                    : "dark:bg-gray-800"
                }`}
              onClick={() => onTemplateSelect(template)}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{template.icon}</span>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {template.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {template.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 