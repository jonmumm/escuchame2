import { createActorKitMockClient } from "actor-kit/test";
import React from "react";
import { UserContext } from "../app/user.context";
import type { UserMachine } from "../app/user.machine";
import { defaultUserSnapshot } from "./remix-stub";

export const createMockClient = () => {
  return createActorKitMockClient<UserMachine>({
    initialSnapshot: defaultUserSnapshot,
  });
};

export const withMockClient = (Story: React.ComponentType) => {
  const mockClient = createMockClient();

  return (
    <UserContext.ProviderFromClient client={mockClient}>
      <Story />
    </UserContext.ProviderFromClient>
  );
};
