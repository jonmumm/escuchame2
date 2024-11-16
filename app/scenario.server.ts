import { createMachineServer } from "actor-kit/worker";
import { scenarioMachine } from "./scenario.machine";
import {
  ScenarioClientEventSchema,
  ScenarioInputPropsSchema,
  ScenarioServiceEventSchema,
} from "./scenario.schemas";

export const Scenario = createMachineServer({
  machine: scenarioMachine,
  schemas: {
    clientEvent: ScenarioClientEventSchema,
    serviceEvent: ScenarioServiceEventSchema,
    inputProps: ScenarioInputPropsSchema,
  },
  options: {
    persisted: true,
  },
});

export type ScenarioServer = InstanceType<typeof Scenario>;
export default Scenario;
