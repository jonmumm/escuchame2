import { Globe2, ChevronDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

type Language = {
  code: string;
  name: string;
  nativeName: string;
};

interface LanguageSelectorProps {
  label: string;
  languages: Language[];
  selectedCode: string;
  onChange: (lang: Language) => void;
}

export function LanguageSelector({
  label,
  languages,
  selectedCode,
  onChange,
}: LanguageSelectorProps) {
  const selectedLang = languages.find((lang) => lang.code === selectedCode);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between bg-white dark:bg-gray-800"
          >
            <div className="flex items-center gap-2">
              <Globe2 className="h-4 w-4" />
              <span className="dark:text-gray-100">{selectedLang?.name}</span>
              <span className="text-gray-500 dark:text-gray-400">
                ({selectedLang?.nativeName})
              </span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto">
          {languages.map((lang) => (
            <DropdownMenuItem key={lang.code} onSelect={() => onChange(lang)}>
              <span>{lang.name}</span>
              <span className="ml-2 text-gray-500 dark:text-gray-400">
                ({lang.nativeName})
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 