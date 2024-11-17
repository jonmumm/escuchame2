import { invariant } from "@jonmumm/utils/invariant";
import type { ActorKitStateMachine, Caller } from "actor-kit";
import { assign, DoneActorEvent, fromPromise, setup } from "xstate";
import { z } from "zod";
import { Env } from "./env";
import { ScenarioInputProps } from "./scenario.types";
import { StartConversationPayload } from "./types";
import {
  type UserEvent,
  type UserInput,
  type UserPrivateContext,
  type UserPublicContext,
} from "./user.types";

export const MessageInputSchema = z.object({
  id: z.string(),
  scenario_id: z.string(),
  content: z.string(),
  role: z.enum(["user", "assistant"]),
  type: z.enum(["text", "recipe", "image", "file"]),
  created_at: z.string().optional(),
});

export type MessageInput = z.infer<typeof MessageInputSchema>;

export const MessagesArraySchema = z.array(MessageInputSchema);

export type MessagesArray = z.infer<typeof MessagesArraySchema>;

type UserServerContext = {
  public: UserPublicContext;
  private: Record<string, UserPrivateContext>;
  children?: Record<string, never>;
};

export const userMachine: ActorKitStateMachine<
  UserEvent,
  UserInput,
  UserServerContext
> = setup({
  types: {
    context: {} as UserServerContext,
    events: {} as UserEvent,
    input: {} as UserInput,
  },
  actions: {
    updateScenarioIds: assign({
      public: ({ context }, { scenarioId }: { scenarioId: string }) => {
        return {
          ...context.public,
          scenarioIds: [...context.public.scenarioIds, scenarioId],
          lastMessageAt: Date.now(),
        };
      },
    }),
  },
  actors: {
    spawnScenario: fromPromise(
      async ({
        input,
      }: {
        input: {
          env: Env;
          caller: Caller;
          payload: StartConversationPayload;
        };
      }) => {
        const scenarioId = input.payload.id;
        const durableObjectId = input.env.SCENARIO.idFromName(scenarioId);
        const stub = input.env.SCENARIO.get(durableObjectId);
        await stub.spawn({
          actorType: "scenario",
          actorId: scenarioId,
          caller: {
            type: "client",
            id: input.caller.id,
          },
          input: input.payload satisfies ScenarioInputProps,
        });
        return { scenarioId };
      }
    ),
  },
}).createMachine({
  id: "user",
  type: "parallel",
  context: ({ input }: { input: UserInput }) => ({
    public: {
      id: input.id,
      ownerId: input.caller.id,
      createdAt: Date.now(),
      lastMessageAt: Date.now(),
      scenarioIds: [],
    },
    private: {
      [input.caller.id]: {
        userIds: [],
      },
    },
    children: {},
  }),
  states: {
    Initialization: {
      initial: "Ready",
      states: {
        Ready: {},
      },
    },
    Row: {
      initial: "Uninitialized",
      states: {
        Uninitialized: {
          always: {
            target: "Initializing",
            guard: ({ event }: { event: UserEvent }) => !!event.env,
          },
        },
        Initializing: {},
        Created: {},
      },
    },

    Scenarios: {
      initial: "Idle",
      states: {
        Idle: {
          on: {
            CREATE_SCENARIO: {
              target: "Spawning",
            },
          },
        },
        Spawning: {
          invoke: {
            src: "spawnScenario",
            input: ({ event }: { event: UserEvent }) => {
              invariant(
                event.type === "CREATE_SCENARIO",
                "Expected CREATE_SCENARIO event"
              );

              return {
                env: event.env as Env,
                scenarioId: event.scenarioId,
                caller: event.caller,
                payload: event.payload,
              };
            },
            onDone: {
              target: "Idle",
              actions: [
                {
                  type: "updateScenarioIds",
                  params: ({
                    event,
                  }: {
                    event: DoneActorEvent<{ scenarioId: string }>;
                  }) => ({
                    scenarioId: event.output.scenarioId,
                  }),
                },
              ],
            },
          },
        },
      },
    },
  },
});

export type UserMachine = typeof userMachine;
