import type { Meta, StoryObj } from "@storybook/react";
import { LanguageSelector } from "./language-selector";

const meta = {
  title: "Homepage/LanguageSelector",
  component: LanguageSelector,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof LanguageSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

const languages = [
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "en", name: "English", nativeName: "English" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
];

export const Native: Story = {
  args: {
    label: "I speak",
    languages: languages,
    selectedCode: "en",
    onChange: (lang) => console.log("Selected language:", lang),
  },
};

export const Target: Story = {
  args: {
    label: "I want to practice",
    languages: languages,
    selectedCode: "es",
    onChange: (lang) => console.log("Selected language:", lang),
  },
}; 