import type {
  ActorKitEmittedEvent,
  AnyActorKitStateMachine,
  CallerSnapshotFrom,
} from "actor-kit";
import { z, ZodSchema } from "zod";
import { StartConvserationPayloadSchema } from "./schemas";

export type StartConversationPayload = z.infer<
  typeof StartConvserationPayloadSchema
>;

export interface LLMModel<TInput extends { [key: string]: unknown }> {
  name: string;
  outputSchema: ZodSchema;
  getUserMessage: (input: TInput) => string;
  getSystemMessage: (input: TInput) => string;
}

// Type definitions
export type ExtractType<T, TypeString> = T extends { type: infer U }
  ? U extends TypeString
    ? T
    : never
  : never;

// Type-level string manipulation for converting to SCREAMING_SNAKE_CASE
type SplitCase<S extends string> = S extends `${infer T}-${infer U}`
  ? [...SplitCase<T>, ...SplitCase<U>]
  : S extends `${infer T}${infer U}`
  ? T extends Uppercase<T>
    ? U extends Lowercase<U>
      ? T extends Lowercase<T>
        ? [...SplitCase<T>, ...SplitCase<U>]
        : [T, ...SplitCase<U>]
      : [T, ...SplitCase<U>]
    : [...SplitCase<T>, ...SplitCase<U>]
  : S extends ""
  ? []
  : [S];

type Join<T extends string[], D extends string> = T extends []
  ? never
  : T extends [string]
  ? Uppercase<T[0]>
  : T extends [string, ...infer U]
  ? U extends string[]
    ? `${Uppercase<T[0]>}${D}${Join<U, D>}`
    : never
  : string;

type ToScreamingSnakeCase<S extends string> = Join<SplitCase<S>, "_">;

// The actual ActorKitEmitted type using compile-time case conversion
export type ActorKitEmitted<
  TActorType extends string,
  TMachine extends AnyActorKitStateMachine
> =
  | {
      type: `${ToScreamingSnakeCase<TActorType>}_UPDATED`;
      actorType: TActorType;
      actorId: string;
      snapshot: CallerSnapshotFrom<TMachine>;
      operations: ActorKitEmittedEvent["operations"];
    }
  | {
      type: `${ToScreamingSnakeCase<TActorType>}_ERROR`;
      actorType: TActorType;
      actorId: string;
      error: Error;
    }
  | {
      type: `${ToScreamingSnakeCase<TActorType>}_INITIALIZED`;
      actorType: TActorType;
      actorId: string;
      snapshot: CallerSnapshotFrom<TMachine>;
    };
