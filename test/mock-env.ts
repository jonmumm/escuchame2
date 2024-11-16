import type { DurableObjectNamespace } from "@cloudflare/workers-types";
import type { Remix } from "../app/remix.server";
import type { ScenarioServer } from "../app/scenario.server";
import type { UserServer } from "../app/user.server";

export interface Env {
  REMIX: DurableObjectNamespace<Remix>;
  USER: DurableObjectNamespace<UserServer>;
  SCENARIO: DurableObjectNamespace<ScenarioServer>;
  SESSION_JWT_SECRET: string;
  ACTOR_KIT_SECRET: string;
  OPENAI_API_KEY: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  ACTOR_KIT_HOST: string;
  NODE_ENV: string;
}

export const createMockEnv = (): Env => ({
  REMIX: {} as DurableObjectNamespace<Remix>,
  USER: {} as DurableObjectNamespace<UserServer>,
  SCENARIO: {} as DurableObjectNamespace<ScenarioServer>,
  SESSION_JWT_SECRET: "test-secret",
  ACTOR_KIT_SECRET: "test-secret",
  OPENAI_API_KEY: "test-key",
  CLOUDFLARE_ACCOUNT_ID: "test-account",
  ACTOR_KIT_HOST: "http://localhost:8787",
  NODE_ENV: "test",
});
