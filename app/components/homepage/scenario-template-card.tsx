interface ScenarioTemplateCardProps {
  title: string;
  description: string;
  icon: string;
  isSelected: boolean;
  onClick: () => void;
}

export function ScenarioTemplateCard({
  title,
  description,
  icon,
  isSelected,
  onClick,
}: ScenarioTemplateCardProps) {
  const testId = `template-${title.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <button
      data-testid={testId}
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700
        hover:border-blue-500 dark:hover:border-blue-400
        transition-all duration-200 hover:shadow-md hover:scale-[1.02]
        focus:outline-none focus:ring-2 focus:ring-blue-500
        ${
          isSelected
            ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/50"
            : "dark:bg-gray-800"
        }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
} 