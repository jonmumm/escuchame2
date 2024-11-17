import {
  ActorKitSystemEvent,
  BaseActorKitEvent,
  EnvWithDurableObjects,
  WithActorKitEvent,
  WithActorKitInput,
} from "actor-kit";
import { z } from "zod";
import {
  ScenarioClientEventSchema,
  ScenarioInputPropsSchema,
  ScenarioServiceEventSchema,
} from "./scenario.schemas";

export interface Message {
  id: string;
  author: {
    id: string;
    isAI?: boolean;
  };
  timestamp: Date;
  audio: {
    id: string;
    audioUrl: string;
    duration: number;
  };
}

export type ScenarioType = "template" | "custom" | "lucky";

export type ScenarioPublicContext = {
  id: string;
  ownerId: string;
  createdAt: number;
  lastMessageAt: number;
  type: ScenarioType;
  title?: string;
  description?: string;
  prompt?: string;
  nativeLanguage: string;
  targetLanguage: string;
  messages: Message[];
  isGeneratingResponse: boolean;
};

export type ScenarioPrivateContext = {
  userIds: string[];
};

export type ScenarioClientEvent = z.infer<typeof ScenarioClientEventSchema>;
export type ScenarioServiceEvent = z.infer<typeof ScenarioServiceEventSchema>;
export type ScenarioEvent = (
  | WithActorKitEvent<ScenarioClientEvent, "client">
  | WithActorKitEvent<ScenarioServiceEvent, "service">
  | ActorKitSystemEvent
) &
  BaseActorKitEvent<EnvWithDurableObjects>;

export type ScenarioInputProps = z.infer<typeof ScenarioInputPropsSchema>;

export type ScenarioInput = WithActorKitInput<ScenarioInputProps> & {
  id: string;
  caller: { id: string };
  storage: DurableObjectStorage;
};

export type ScenarioServerContext = {
  public: ScenarioPublicContext;
  private: Record<string, ScenarioPrivateContext>;
};

export type ScenarioState = {
  Initialization: {};
  Idle: {};
  Generating: {};
  Recording: {};
  Error: { error: string };
};
