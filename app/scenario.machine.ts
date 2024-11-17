import { ActorKitStateMachine, BaseActorKitEvent, EnvWithDurableObjects } from "actor-kit";
import { setup } from "xstate";
import {
  ScenarioEvent,
  ScenarioInput,
  ScenarioServerContext,
  ScenarioType,
} from "./scenario.types";

// Define internal events with required Actor Kit properties
type InternalEvent = BaseActorKitEvent<EnvWithDurableObjects> & (
  | { type: "READY" }
  | { type: "START_GENERATING" }
  | { type: "START_RECORDING" }
  | { type: "GENERATED" }
  | { type: "STOP_RECORDING" }
  | { type: "ERROR" }
  | { type: "RETRY" }
);

export const scenarioMachine = setup({
  types: {
    context: {} as ScenarioServerContext,
    events: {} as ScenarioEvent | InternalEvent,
    input: {} as ScenarioInput,
  },
  actors: {},
  guards: {},
}).createMachine({
  id: "scenario",
  type: "parallel",
  context: ({ input }: { input: ScenarioInput }) => ({
    public: {
      id: input.id,
      ownerId: input.caller.id,
      createdAt: Date.now(),
      lastMessageAt: Date.now(),
      type: "template" as ScenarioType,
      nativeLanguage: "English",
      targetLanguage: "Spanish",
      messages: [],
      isGeneratingResponse: true,
    },
    private: {
      [input.caller.id]: {
        userIds: ["system"],
      },
    },
  }),
  states: {
    Initialization: {
      on: {
        READY: {
          target: "Idle",
        },
      },
    },
    Idle: {
      on: {
        START_GENERATING: {
          target: "Generating",
        },
        START_RECORDING: {
          target: "Recording",
        },
      },
    },
    Generating: {
      on: {
        GENERATED: {
          target: "Idle",
        },
        ERROR: {
          target: "Error",
        },
      },
    },
    Recording: {
      on: {
        STOP_RECORDING: {
          target: "Generating",
        },
        ERROR: {
          target: "Error",
        },
      },
    },
    Error: {
      on: {
        RETRY: {
          target: "Idle",
        },
      },
    },
  },
}) satisfies ActorKitStateMachine<
  ScenarioEvent | InternalEvent,
  ScenarioInput,
  ScenarioServerContext
>;

export type ScenarioMachine = typeof scenarioMachine;
