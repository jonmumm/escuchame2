import type { Meta, StoryObj } from "@storybook/react";
import { ChatScreen } from "./chat-screen";

const meta = {
  title: "Screens/ChatScreen",
  component: ChatScreen,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ChatScreen>;

export default meta;
type Story = StoryObj<typeof ChatScreen>;

// Create a more realistic waveform pattern
const generateWaveform = (length: number = 100) => {
  return Array.from({ length }, (_, i) => {
    // Create a bell curve-like pattern
    const x = (i / length) * 2 - 1;
    const amplitude = Math.exp(-x * x * 2) * 0.8 + Math.random() * 0.2;
    return amplitude;
  });
};

const sampleMessages = [
  {
    id: "msg-1",
    author: { id: "user-1", isAI: false },
    timestamp: new Date("2024-03-10T10:00:00"),
    audio: {
      id: "audio-1",
      audioUrl: "/sample-greeting.mp3",
      duration: 8, // 8 seconds
      waveform: generateWaveform(),
    },
  },
  {
    id: "msg-2",
    author: { id: "ai-1", isAI: true },
    timestamp: new Date("2024-03-10T10:01:00"),
    audio: {
      id: "audio-2",
      audioUrl: "/sample-greeting.mp3",
      duration: 6, // 6 seconds
      waveform: generateWaveform(),
    },
  },
];

export const NewConversation: Story = {
  args: {
    messages: [],
  },
};

export const OngoingConversation: Story = {
  args: {
    messages: sampleMessages,
    defaultIsPromptOpen: false,
  },
};

export const MobileNewConversation: Story = {
  args: {
    messages: [],
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

export const MobileOngoing: Story = {
  args: {
    messages: sampleMessages,
    defaultIsPromptOpen: false,
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
