import type { Meta, StoryObj } from "@storybook/react";
import { ScenarioTemplateCard } from "./scenario-template-card";

const meta = {
  title: "Homepage/ScenarioTemplateCard",
  component: ScenarioTemplateCard,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof ScenarioTemplateCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "At the Café",
    description: "Practice ordering drinks and food at a coffee shop",
    icon: "☕",
    isSelected: false,
    onClick: () => console.log("Template clicked"),
  },
};

export const Selected: Story = {
  args: {
    ...Default.args,
    isSelected: true,
  },
};

export const LongDescription: Story = {
  args: {
    title: "Complex Scenario",
    description:
      "This is a much longer description that might wrap to multiple lines and need to be handled gracefully by the component layout",
    icon: "🎯",
    isSelected: false,
    onClick: () => console.log("Template clicked"),
  },
}; 