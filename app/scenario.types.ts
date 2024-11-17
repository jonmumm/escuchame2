import {
  ActorKitSystemEvent,
  BaseActorKitEvent,
  EnvWithDurableObjects,
  WithActorKitEvent,
  WithActorKitInput,
} from "actor-kit";
import { StateValueFrom } from "xstate";
import { z } from "zod";
import { ScenarioMachine } from "./scenario.machine";
import {
  ScenarioClientEventSchema,
  ScenarioInputPropsSchema,
  ScenarioServiceEventSchema,
} from "./scenario.schemas";
import { ScenarioTypeSchema } from "./schemas";

export interface Message {
  id: string;
  author: {
    id: string;
    isAI?: boolean;
  };
  timestamp: number;
  audio: {
    id: string;
    audioUrl: string;
    duration: number;
  };
}

export type ScenarioType = z.infer<typeof ScenarioTypeSchema>;

export type ScenarioPublicContext = {
  id: string;
  ownerId: string;
  createdAt: number;
  lastMessageAt: number;
  type: ScenarioType;
  prompt: string;
  title?: string;
  nativeLanguage: string;
  targetLanguage: string;
  messages: Message[];
};

export type ScenarioPrivateContext = {};

export type ScenarioClientEvent = z.infer<typeof ScenarioClientEventSchema>;
export type ScenarioServiceEvent = z.infer<typeof ScenarioServiceEventSchema>;
export type ScenarioEvent = (
  | WithActorKitEvent<ScenarioClientEvent, "client">
  | WithActorKitEvent<ScenarioServiceEvent, "service">
  | ActorKitSystemEvent
) &
  BaseActorKitEvent<EnvWithDurableObjects>;

export type ScenarioInputProps = z.infer<typeof ScenarioInputPropsSchema>;

export type ScenarioInput = WithActorKitInput<ScenarioInputProps>;

export type ScenarioServerContext = {
  public: ScenarioPublicContext;
  private: Record<string, ScenarioPrivateContext>;
};

export type ScenarioState = StateValueFrom<ScenarioMachine>;
