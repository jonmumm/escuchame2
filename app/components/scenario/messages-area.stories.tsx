import type { Meta, StoryObj } from "@storybook/react";
import { MessagesArea } from "./messages-area";

const meta = {
  title: "Scenario/MessagesArea",
  component: MessagesArea,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MessagesArea>;

export default meta;
type Story = StoryObj<typeof MessagesArea>;

// Sample audio data (base64 encoded short beep)
const SAMPLE_AUDIO = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10..."; // Use actual base64 audio

const sampleMessages = [
  {
    id: "msg-1",
    author: { id: "ai-1", isAI: true },
    timestamp: new Date("2024-03-10T10:00:00"),
    audio: {
      id: "audio-1",
      audioUrl: SAMPLE_AUDIO,
      duration: 8,
    },
  },
  {
    id: "msg-2",
    author: { id: "user-1", isAI: false },
    timestamp: new Date("2024-03-10T10:01:00"),
    audio: {
      id: "audio-2",
      audioUrl: SAMPLE_AUDIO,
      duration: 6,
    },
  },
  {
    id: "msg-3",
    author: { id: "ai-1", isAI: true },
    timestamp: new Date("2024-03-10T10:02:00"),
    audio: {
      id: "audio-3",
      audioUrl: SAMPLE_AUDIO,
      duration: 10,
    },
  },
];

// Initial loading state when conversation is starting
export const InitialLoading: Story = {
  args: {
    messages: [],
    isGeneratingResponse: true,
  },
};

// Conversation with messages
export const WithMessages: Story = {
  args: {
    messages: sampleMessages,
    isGeneratingResponse: false,
  },
};

// Conversation with messages and generating next response
export const GeneratingResponse: Story = {
  args: {
    messages: sampleMessages,
    isGeneratingResponse: true,
  },
}; 