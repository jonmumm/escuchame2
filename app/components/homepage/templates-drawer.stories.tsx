import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TemplatesDrawer } from "./templates-drawer";
import { Drawer } from "vaul";

const meta = {
  title: "Homepage/TemplatesDrawer",
  component: TemplatesDrawer,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story, context) => (
      <Drawer.Root open={context.args.isOpen} onOpenChange={context.args.onOpenChange}>
        <Story />
      </Drawer.Root>
    ),
  ],
} satisfies Meta<typeof TemplatesDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleTemplates = [
  {
    title: "At the Doctor",
    description: "Describing symptoms and understanding medical advice",
    icon: "🏥",
  },
  {
    title: "At the Pharmacy",
    description: "Getting medicine and explaining prescriptions",
    icon: "💊",
  },
  {
    title: "Dental Visit",
    description: "Discussing dental problems and procedures",
    icon: "🦷",
  },
  {
    title: "Job Interview",
    description: "Professional conversations and career discussions",
    icon: "💼",
  },
];

export const Default: Story = {
  args: {
    isOpen: true,
    onOpenChange: (open) => console.log("Drawer open state:", open),
    templates: sampleTemplates,
    selectedTemplate: undefined,
    onTemplateSelect: (template) => console.log("Selected template:", template),
  },
};

export const WithSelection: Story = {
  args: {
    ...Default.args,
    selectedTemplate: sampleTemplates[1],
  },
}; 