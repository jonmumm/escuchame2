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

export type ScenarioPublicContext = {
  ownerId: string;
  createdAt: number;
  lastMessageAt: number;
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

// export type UserEvent = (
//   | WithActorKitEvent<UserClientEvent, "client">
//   | WithActorKitEvent<UserServiceEvent, "service">
//   | ActorKitSystemEvent
// ) &
//   BaseActorKitEvent<EnvWithDurableObjects>;

export type ScenarioInputProps = z.infer<typeof ScenarioInputPropsSchema>;

export type ScenarioInput = WithActorKitInput<
  z.infer<typeof ScenarioInputPropsSchema>
> & {
  id: string;
  caller: { id: string };
  storage: DurableObjectStorage;
};

export type ScenarioServerContext = {
  public: ScenarioPublicContext;
  private: Record<string, ScenarioPrivateContext>;
};
