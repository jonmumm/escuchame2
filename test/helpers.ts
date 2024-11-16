import { createActorKitMockClient } from "actor-kit/test";
import type { UserMachine } from "../app/user.machine";
import { defaultUserSnapshot } from "./remix-stub";

export function createMockUserClient() {
  return createActorKitMockClient<UserMachine>({
    initialSnapshot: defaultUserSnapshot,
  });
}

export async function simulateServerResponse(scenarioId: string, delay = 1000) {
  // Wait for simulated server delay
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Create a mock client
  const mockClient = createMockUserClient();

  // Update state using produce
  mockClient.produce((draft) => {
    draft.public.scenarioIds.push(scenarioId);
  });

  return mockClient;
}
