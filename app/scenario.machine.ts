import { ActorKitStateMachine } from "actor-kit";
import { setup } from "xstate";
import {
  ScenarioEvent,
  ScenarioInput,
  ScenarioServerContext,
} from "./scenario.types";

export const scenarioMachine = setup({
  types: {
    context: {} as ScenarioServerContext,
    events: {} as ScenarioEvent,
    input: {} as ScenarioInput,
  },
  actors: {},
  guards: {},
}).createMachine({
  id: "user",
  type: "parallel",
  context: ({ input }: { input: ScenarioInput }) => {
    console.log("SCENARIO CONTEXT", input);
    return {
      public: {
        id: input.id,
        ownerId: input.caller.id,
        createdAt: Date.now(),
        lastMessageAt: Date.now(),
      },
      private: {},
    };
  },
  states: {
    Initialization: {
      on: {
        NEW_MESSAGE: {
          actions: ({ event }: { event: ScenarioEvent }) => {
            console.log("SCENARIO NEW_MESSAGE", event);
          },
        },
      },
    },
  },
}) satisfies ActorKitStateMachine<
  ScenarioEvent,
  ScenarioInput,
  ScenarioServerContext
>;

export type ScenarioMachine = typeof scenarioMachine;
