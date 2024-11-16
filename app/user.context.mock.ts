import { fn } from '@storybook/test';
import * as actual from './user.context';
import { createActorKitMockClient } from "actor-kit/test";
import { defaultUserSnapshot } from "../test/remix-stub";

const mockClient = createActorKitMockClient({
  initialSnapshot: defaultUserSnapshot,
});

export const UserContext = {
  ...actual.UserContext,
  useClient: fn(() => mockClient).mockName('useClient'),
  useSend: fn(() => () => {}).mockName('useSend'),
  Provider: actual.UserContext.Provider,
  ProviderFromClient: actual.UserContext.ProviderFromClient,
}; 