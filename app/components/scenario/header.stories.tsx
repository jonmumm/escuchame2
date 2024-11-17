import type { Meta, StoryObj } from "@storybook/react";
import { Header } from "./header";

const meta = {
  title: "Scenario/Header",
  component: Header,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof Header>;

export const Template: Story = {
  args: {
    scenarioDetails: {
      type: "template",
      title: "At the Café",
      description: "Practice ordering drinks and food at a coffee shop",
      nativeLanguage: "English",
      targetLanguage: "Spanish",
    },
    onBack: () => console.log("Back clicked"),
  },
};

export const Lucky: Story = {
  args: {
    scenarioDetails: {
      type: "lucky",
      nativeLanguage: "English",
      targetLanguage: "Japanese",
    },
    onBack: () => console.log("Back clicked"),
  },
};

export const Custom: Story = {
  args: {
    scenarioDetails: {
      type: "custom",
      prompt: "I want to practice discussing my favorite movies",
      nativeLanguage: "English",
      targetLanguage: "French",
    },
    onBack: () => console.log("Back clicked"),
  },
}; 