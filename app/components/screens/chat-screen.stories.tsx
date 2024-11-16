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
const generateWaveform = (length: number = 64) => {
  return Array.from({ length }, (_, i) => {
    // Create a more natural looking waveform
    const position = i / length;
    const frequency = 2; // Adjust for more/less waves
    const amplitude = Math.sin(position * Math.PI * frequency);
    return 0.3 + Math.abs(amplitude) * 0.7; // Ensures values between 0.3 and 1.0
  });
};

// Make sure the sample audio URL exists
const SAMPLE_AUDIO = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10..."; // Use your base64 audio

const sampleMessages = [
  {
    id: "msg-1",
    author: { id: "user-1", isAI: false },
    timestamp: new Date("2024-03-10T10:00:00"),
    audio: {
      id: "audio-1",
      audioUrl: SAMPLE_AUDIO,
      duration: 8,
      waveform: generateWaveform(),
    },
  },
  {
    id: "msg-2",
    author: { id: "ai-1", isAI: true },
    timestamp: new Date("2024-03-10T10:01:00"),
    audio: {
      id: "audio-2",
      audioUrl: SAMPLE_AUDIO,
      duration: 6,
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
