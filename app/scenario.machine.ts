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
  id: "scenario",
  type: "parallel",
  context: ({ input }: { input: ScenarioInput }) => {
    console.log("input", input);
    console.log("input", input);
    console.log("input", input);
    console.log("input", input);
    console.log("input", input);
    console.log("input", input);
    console.log("input", input);
    return {
      public: {
        id: input.id,
        ownerId: input.caller.id,
        createdAt: Date.now(),
        lastMessageAt: Date.now(),
        type: input.type,
        nativeLanguage: input.nativeLanguage,
        targetLanguage: input.targetLanguage,
        prompt: input.prompt,
        // title:   // todo: set this from the prompt (if custom), or explicitly pass it up from client (if selection)
        messages: [],
      },
      private: {},
    };
  },
  states: {
    Initialization: {},
    Idle: {},
    IsGenerating: {
      initial: "True",
      states: {
        True: {},
        False: {},
      },
    },
    Recording: {},
    Error: {},
  },
}) satisfies ActorKitStateMachine<
  ScenarioEvent,
  ScenarioInput,
  ScenarioServerContext
>;

export type ScenarioMachine = typeof scenarioMachine;
