import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "@storybook/testing-library";
import { createActorKitMockClient } from "actor-kit/test";
import React from "react";
import { withRouter } from "storybook-addon-react-router-v6";
import { StateValueFrom } from "xstate";
import { ScenarioContext } from "../../scenario.context";
import type { ScenarioMachine } from "../../scenario.machine";
import { ScenarioView } from "./scenario-view";
import { expect, fn } from "@storybook/test";

// Sample audio data (base64 encoded short beep)
const SAMPLE_AUDIO = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10..."; // Use actual base64 audio

type Story = StoryObj<typeof ScenarioView>;

const meta = {
  title: "Components/ScenarioView",
  component: ScenarioView,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    withRouter({
      routes: ["/scenario/:id"],
      initialEntries: ["/scenario/123"],
      path: "/scenario/:id",
    }),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof ScenarioView>;

export default meta;

// Helper to create messages for different scenarios
const createMessages = (scenario: string) => {
  switch (scenario) {
    case "cafe":
      return [
        {
          id: "msg-1",
          author: { id: "ai-1", isAI: true },
          timestamp: 1710064800000, // 2024-03-10T10:00:00.000Z
          audio: { id: "audio-1", audioUrl: SAMPLE_AUDIO, duration: 8 },
        },
        {
          id: "msg-2",
          author: { id: "user-1", isAI: false },
          timestamp: 1710064860000, // 2024-03-10T10:01:00.000Z
          audio: { id: "audio-2", audioUrl: SAMPLE_AUDIO, duration: 4 },
        },
        {
          id: "msg-3",
          author: { id: "ai-1", isAI: true },
          timestamp: 1710064920000, // 2024-03-10T10:02:00.000Z
          audio: { id: "audio-3", audioUrl: SAMPLE_AUDIO, duration: 10 },
        },
      ];
    case "doctor":
      return [
        {
          id: "msg-1",
          author: { id: "ai-1", isAI: true },
          timestamp: 1710064800000, // 2024-03-10T10:00:00.000Z
          audio: { id: "audio-1", audioUrl: SAMPLE_AUDIO, duration: 12 },
        },
        {
          id: "msg-2",
          author: { id: "user-1", isAI: false },
          timestamp: 1710064860000, // 2024-03-10T10:01:00.000Z
          audio: { id: "audio-2", audioUrl: SAMPLE_AUDIO, duration: 7 },
        },
        {
          id: "msg-3",
          author: { id: "ai-1", isAI: true },
          timestamp: 1710064920000, // 2024-03-10T10:02:00.000Z
          audio: { id: "audio-3", audioUrl: SAMPLE_AUDIO, duration: 15 },
        },
        {
          id: "msg-4",
          author: { id: "user-1", isAI: false },
          timestamp: 1710064980000, // 2024-03-10T10:03:00.000Z
          audio: { id: "audio-4", audioUrl: SAMPLE_AUDIO, duration: 5 },
        },
      ];
    case "shopping":
      return [
        {
          id: "msg-1",
          author: { id: "ai-1", isAI: true },
          timestamp: 1710064800000, // 2024-03-10T10:00:00.000Z
          audio: { id: "audio-1", audioUrl: SAMPLE_AUDIO, duration: 6 },
        },
        {
          id: "msg-2",
          author: { id: "user-1", isAI: false },
          timestamp: 1710064860000, // 2024-03-10T10:01:00.000Z
          audio: { id: "audio-2", audioUrl: SAMPLE_AUDIO, duration: 3 },
        },
        {
          id: "msg-3",
          author: { id: "ai-1", isAI: true },
          timestamp: 1710064920000, // 2024-03-10T10:02:00.000Z
          audio: { id: "audio-3", audioUrl: SAMPLE_AUDIO, duration: 8 },
        },
        {
          id: "msg-4",
          author: { id: "user-1", isAI: false },
          timestamp: 1710064980000, // 2024-03-10T10:03:00.000Z
          audio: { id: "audio-4", audioUrl: SAMPLE_AUDIO, duration: 4 },
        },
        {
          id: "msg-5",
          author: { id: "ai-1", isAI: true },
          timestamp: 1710065040000, // 2024-03-10T10:04:00.000Z
          audio: { id: "audio-5", audioUrl: SAMPLE_AUDIO, duration: 10 },
        },
      ];
    default:
      return [];
  }
};

// Update the state values to match the machine
const defaultPrivateContext = {
  userIds: [],
};

// Helper to create default context values
const createDefaultContext = (id: string) => ({
  id,
  ownerId: "user-123",
  createdAt: Date.now(),
  lastMessageAt: Date.now(),
  prompt: "",
});

// Initial state - just starting
export const Initial: Story = {
  render: () => {
    const mockClient = createActorKitMockClient<ScenarioMachine>({
      initialSnapshot: {
        public: {
          ...createDefaultContext("123"),
          type: "template",
          title: "At the Café",
          prompt: "Practice ordering at a café",
          nativeLanguage: "English",
          targetLanguage: "Spanish",
          messages: [],
        },
        private: defaultPrivateContext,
        value: {
          Initialization: {},
          Idle: {},
          IsGenerating: "False",
          Recording: {},
          Error: {},
        },
      },
    });
    return <ScenarioContext.ProviderFromClient client={mockClient}><ScenarioView /></ScenarioContext.ProviderFromClient>;
  },
};

// Café conversation in progress
export const CafeConversation: Story = {
  render: () => {
    const mockClient = createActorKitMockClient<ScenarioMachine>({
      initialSnapshot: {
        public: {
          ...createDefaultContext("cafe-123"),
          type: "template",
          title: "At the Café",
          prompt: "Practice ordering drinks and food at a coffee shop",
          nativeLanguage: "English",
          targetLanguage: "Spanish",
          messages: createMessages("cafe"),
        },
        private: defaultPrivateContext,
        value: {
          Initialization: {},
          Idle: {},
          IsGenerating: "False",
          Recording: {},
          Error: {},
        },
      },
    });
    return <ScenarioContext.ProviderFromClient client={mockClient}><ScenarioView /></ScenarioContext.ProviderFromClient>;
  },
};

// Doctor's appointment conversation
export const DoctorConversation: Story = {
  render: () => {
    const mockClient = createActorKitMockClient<ScenarioMachine>({
      initialSnapshot: {
        public: {
          ...createDefaultContext("doctor-123"),
          type: "template",
          title: "At the Doctor",
          prompt: "Practice explaining symptoms and understanding medical advice",
          nativeLanguage: "English",
          targetLanguage: "Japanese",
          messages: createMessages("doctor"),
        },
        private: defaultPrivateContext,
        value: {
          Initialization: {},
          Idle: {},
          IsGenerating: "True",
          Recording: {},
          Error: {},
        },
      },
    });
    return <ScenarioContext.ProviderFromClient client={mockClient}><ScenarioView /></ScenarioContext.ProviderFromClient>;
  },
};

// Shopping conversation with more back-and-forth
export const ShoppingConversation: Story = {
  render: () => {
    const mockClient = createActorKitMockClient<ScenarioMachine>({
      initialSnapshot: {
        public: {
          ...createDefaultContext("shopping-123"),
          type: "template",
          title: "Shopping",
          prompt: "Practice asking about prices and making purchases",
          nativeLanguage: "English",
          targetLanguage: "French",
          messages: createMessages("shopping"),
        },
        private: defaultPrivateContext,
        value: {
          Initialization: {},
          Idle: {},
          IsGenerating: "False",
          Recording: {},
          Error: {},
        },
      },
    });
    return <ScenarioContext.ProviderFromClient client={mockClient}><ScenarioView /></ScenarioContext.ProviderFromClient>;
  },
};

// Custom conversation example
export const CustomConversation: Story = {
  render: () => {
    const mockClient = createActorKitMockClient<ScenarioMachine>({
      initialSnapshot: {
        public: {
          ...createDefaultContext("custom-123"),
          type: "custom",
          prompt: "I want to practice discussing my favorite movies and TV shows",
          nativeLanguage: "English",
          targetLanguage: "Korean",
          messages: [
            {
              id: "msg-1",
              author: { id: "ai-1", isAI: true },
              timestamp: 1710064800000,
              audio: { id: "audio-1", audioUrl: SAMPLE_AUDIO, duration: 15 },
            },
          ],
        },
        private: defaultPrivateContext,
        value: {
          Initialization: {},
          Idle: {},
          IsGenerating: "False",
          Recording: {},
          Error: {},
        },
      },
    });
    return <ScenarioContext.ProviderFromClient client={mockClient}><ScenarioView /></ScenarioContext.ProviderFromClient>;
  },
};

// Recording state example
export const Recording: Story = {
  render: () => {
    const mockClient = createActorKitMockClient<ScenarioMachine>({
      initialSnapshot: {
        public: {
          ...createDefaultContext("123"),
          type: "template",
          title: "At the Café",
          prompt: "Practice ordering drinks and food at a coffee shop",
          nativeLanguage: "English",
          targetLanguage: "Spanish",
          messages: createMessages("cafe"),
        },
        private: defaultPrivateContext,
        value: {
          Initialization: {},
          Idle: {},
          IsGenerating: "False",
          Recording: {},
          Error: {},
        },
      },
    });
    return <ScenarioContext.ProviderFromClient client={mockClient}><ScenarioView /></ScenarioContext.ProviderFromClient>;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const recordButton = await canvas.findByRole("button", { name: /start recording/i });
    await userEvent.click(recordButton);
  },
};

// Test recording event sequence
export const RecordingEventSequence: Story = {
  play: async ({ canvasElement, mount }) => {
    const sendSpy = fn();
    const mockClient = createActorKitMockClient<ScenarioMachine>({
      initialSnapshot: {
        public: {
          ...createDefaultContext("test-123"),
          type: "template",
          title: "At the Café",
          prompt: "Practice ordering drinks and food at a coffee shop",
          nativeLanguage: "English",
          targetLanguage: "Spanish",
          messages: [],
        },
        private: defaultPrivateContext,
        value: {
          Initialization: {},
          Idle: {},
          IsGenerating: "False",
          Recording: {},
          Error: {},
        },
      },
      onSend: sendSpy,
    });

    // Mount the component with the mock client
    await mount(
      <ScenarioContext.ProviderFromClient client={mockClient}>
        <ScenarioView />
      </ScenarioContext.ProviderFromClient>
    );

    const canvas = within(canvasElement);
    
    // Start recording
    const recordButton = await canvas.findByRole("button", {
      name: /start recording/i,
    });
    await userEvent.click(recordButton);

    // Wait a bit to collect some audio chunks
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Stop recording
    await userEvent.click(recordButton);

    // Wait for final events
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verify event sequence
    const eventTypes = sendSpy.mock.calls.map(call => call[0].type);
    
    // Verify we got some audio chunks
    expect(eventTypes.filter(t => t === "AUDIO_CHUNK_APPEND").length).toBeGreaterThan(0);
    
    // Verify the final events are in order
    const finalEvents = eventTypes.slice(-2);
    expect(finalEvents).toEqual([
      "AUDIO_CHUNK_COMMIT",
      "GENERATE_RESPONSE"
    ]);
  }
};
