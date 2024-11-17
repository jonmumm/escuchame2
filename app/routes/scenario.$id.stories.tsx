import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "@storybook/testing-library";
import { CallerSnapshotFrom } from "actor-kit";
import { withActorKit } from "actor-kit/storybook";
import { withRouter } from "storybook-addon-react-router-v6";
import { ScenarioContext } from "../scenario.context";
import type { ScenarioMachine } from "../scenario.machine";
import type { ScenarioState } from "../scenario.types";
import ScenarioPage from "./scenario.$id";

// Sample audio data (base64 encoded short beep)
const SAMPLE_AUDIO = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10..."; // Use actual base64 audio

type Story = StoryObj<typeof ScenarioPage> & {
  parameters: {
    actorKit?: {
      scenario: {
        [actorId: string]: CallerSnapshotFrom<ScenarioMachine>;
      };
    };
  };
};

const meta = {
  title: "Pages/ScenarioPage",
  component: ScenarioPage,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    withRouter({
      routes: ["/scenario/:id"],
      initialEntries: ["/scenario/123"],
      path: "/scenario/:id",
    }),
    withActorKit<ScenarioMachine>({
      actorType: "scenario",
      context: ScenarioContext,
    }),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof ScenarioPage>;

export default meta;

// Helper to create messages for different scenarios
const createMessages = (scenario: string) => {
  switch (scenario) {
    case "cafe":
      return [
        {
          id: "msg-1",
          author: { id: "ai-1", isAI: true },
          timestamp: new Date("2024-03-10T10:00:00"),
          audio: { id: "audio-1", audioUrl: SAMPLE_AUDIO, duration: 8 },
        },
        {
          id: "msg-2",
          author: { id: "user-1", isAI: false },
          timestamp: new Date("2024-03-10T10:01:00"),
          audio: { id: "audio-2", audioUrl: SAMPLE_AUDIO, duration: 4 },
        },
        {
          id: "msg-3",
          author: { id: "ai-1", isAI: true },
          timestamp: new Date("2024-03-10T10:02:00"),
          audio: { id: "audio-3", audioUrl: SAMPLE_AUDIO, duration: 10 },
        },
      ];
    case "doctor":
      return [
        {
          id: "msg-1",
          author: { id: "ai-1", isAI: true },
          timestamp: new Date("2024-03-10T10:00:00"),
          audio: { id: "audio-1", audioUrl: SAMPLE_AUDIO, duration: 12 },
        },
        {
          id: "msg-2",
          author: { id: "user-1", isAI: false },
          timestamp: new Date("2024-03-10T10:01:00"),
          audio: { id: "audio-2", audioUrl: SAMPLE_AUDIO, duration: 7 },
        },
        {
          id: "msg-3",
          author: { id: "ai-1", isAI: true },
          timestamp: new Date("2024-03-10T10:02:00"),
          audio: { id: "audio-3", audioUrl: SAMPLE_AUDIO, duration: 15 },
        },
        {
          id: "msg-4",
          author: { id: "user-1", isAI: false },
          timestamp: new Date("2024-03-10T10:03:00"),
          audio: { id: "audio-4", audioUrl: SAMPLE_AUDIO, duration: 5 },
        },
      ];
    case "shopping":
      return [
        {
          id: "msg-1",
          author: { id: "ai-1", isAI: true },
          timestamp: new Date("2024-03-10T10:00:00"),
          audio: { id: "audio-1", audioUrl: SAMPLE_AUDIO, duration: 6 },
        },
        {
          id: "msg-2",
          author: { id: "user-1", isAI: false },
          timestamp: new Date("2024-03-10T10:01:00"),
          audio: { id: "audio-2", audioUrl: SAMPLE_AUDIO, duration: 3 },
        },
        {
          id: "msg-3",
          author: { id: "ai-1", isAI: true },
          timestamp: new Date("2024-03-10T10:02:00"),
          audio: { id: "audio-3", audioUrl: SAMPLE_AUDIO, duration: 8 },
        },
        {
          id: "msg-4",
          author: { id: "user-1", isAI: false },
          timestamp: new Date("2024-03-10T10:03:00"),
          audio: { id: "audio-4", audioUrl: SAMPLE_AUDIO, duration: 4 },
        },
        {
          id: "msg-5",
          author: { id: "ai-1", isAI: true },
          timestamp: new Date("2024-03-10T10:04:00"),
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
});

// Helper to create a complete state value object with one active state
const createStateValue = (activeState: keyof ScenarioState) => ({
  Idle: {},
  Generating: {},
  Recording: {},
  Error: { error: "" },
  Initialization: {},
  [activeState]: {},
});

// Initial state - just starting
export const Initial: Story = {
  parameters: {
    reactRouter: {
      browserPath: "/scenario/123",
      routePath: "/scenario/:id",
      routeParams: { id: "123" },
    },
    actorKit: {
      scenario: {
        "123": {
          public: {
            ...createDefaultContext("123"),
            type: "template",
            title: "At the Café",
            description: "Practice ordering drinks and food at a coffee shop",
            nativeLanguage: "English",
            targetLanguage: "Spanish",
            messages: [],
            isGeneratingResponse: true,
          },
          private: defaultPrivateContext,
          value: createStateValue("Initialization"),
        },
      },
    },
  },
};

// Café conversation in progress
export const CafeConversation: Story = {
  parameters: {
    reactRouter: {
      browserPath: "/scenario/cafe-123",
      routePath: "/scenario/:id",
      routeParams: { id: "cafe-123" },
    },
    actorKit: {
      scenario: {
        "cafe-123": {
          public: {
            ...createDefaultContext("cafe-123"),
            type: "template",
            title: "At the Café",
            description: "Practice ordering drinks and food at a coffee shop",
            nativeLanguage: "English",
            targetLanguage: "Spanish",
            messages: createMessages("cafe"),
            isGeneratingResponse: false,
          },
          private: defaultPrivateContext,
          value: createStateValue("Idle"),
        },
      },
    },
  },
};

// Doctor's appointment conversation
export const DoctorConversation: Story = {
  parameters: {
    reactRouter: {
      browserPath: "/scenario/doctor-123",
      routePath: "/scenario/:id",
      routeParams: { id: "doctor-123" },
    },
    actorKit: {
      scenario: {
        "doctor-123": {
          public: {
            ...createDefaultContext("doctor-123"),
            type: "template",
            title: "At the Doctor",
            description:
              "Practice explaining symptoms and understanding medical advice",
            nativeLanguage: "English",
            targetLanguage: "Japanese",
            messages: createMessages("doctor"),
            isGeneratingResponse: true,
          },
          private: defaultPrivateContext,
          value: createStateValue("Generating"),
        },
      },
    },
  },
};

// Shopping conversation with more back-and-forth
export const ShoppingConversation: Story = {
  parameters: {
    reactRouter: {
      browserPath: "/scenario/shopping-123",
      routePath: "/scenario/:id",
      routeParams: { id: "shopping-123" },
    },
    actorKit: {
      scenario: {
        "shopping-123": {
          public: {
            ...createDefaultContext("shopping-123"),
            type: "template",
            title: "Shopping",
            description: "Practice asking about prices and making purchases",
            nativeLanguage: "English",
            targetLanguage: "French",
            messages: createMessages("shopping"),
            isGeneratingResponse: false,
          },
          private: defaultPrivateContext,
          value: createStateValue("Idle"),
        },
      },
    },
  },
};

// Custom conversation example
export const CustomConversation: Story = {
  parameters: {
    reactRouter: {
      browserPath: "/scenario/custom-123",
      routePath: "/scenario/:id",
      routeParams: { id: "custom-123" },
    },
    actorKit: {
      scenario: {
        "custom-123": {
          public: {
            ...createDefaultContext("custom-123"),
            type: "custom",
            prompt:
              "I want to practice discussing my favorite movies and TV shows",
            nativeLanguage: "English",
            targetLanguage: "Korean",
            messages: [
              {
                id: "msg-1",
                author: { id: "ai-1", isAI: true },
                timestamp: new Date("2024-03-10T10:00:00"),
                audio: { id: "audio-1", audioUrl: SAMPLE_AUDIO, duration: 15 },
              },
            ],
            isGeneratingResponse: false,
          },
          private: defaultPrivateContext,
          value: createStateValue("Idle"),
        },
      },
    },
  },
};

// Recording state example
export const Recording: Story = {
  parameters: {
    reactRouter: {
      browserPath: "/scenario/123",
      routePath: "/scenario/:id",
      routeParams: { id: "123" },
    },
    actorKit: {
      scenario: {
        "123": {
          public: {
            ...createDefaultContext("123"),
            type: "template",
            title: "At the Café",
            description: "Practice ordering drinks and food at a coffee shop",
            nativeLanguage: "English",
            targetLanguage: "Spanish",
            messages: createMessages("cafe"),
            isGeneratingResponse: false,
          },
          private: defaultPrivateContext,
          value: createStateValue("Recording"),
        },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const recordButton = await canvas.findByRole("button", {
      name: /start recording/i,
    });
    await userEvent.click(recordButton);
  },
};
