import { createActorKitContext } from "actor-kit/react";
import type { ScenarioMachine } from "./scenario.machine";

export const ScenarioContext = createActorKitContext<ScenarioMachine>("scenario"); 