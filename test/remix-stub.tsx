import { createRemixStub } from "@remix-run/testing";
import type { StoryContext, StoryFn } from "@storybook/react";
import { CallerSnapshotFrom } from "actor-kit";
import React from "react";
import type { UserMachine } from "../app/user.machine";

// Default snapshot for the user machine state
export const defaultUserSnapshot = {
  public: {
    id: "test-session",
    createdAt: Date.now(),
    scenarioIds: [],
  },
  private: {
    userIds: [],
  },
  value: {
    Initialization: "Ready",
    Row: "Created",
    Scenarios: "Idle",
  },
} satisfies CallerSnapshotFrom<UserMachine>;

interface Route {
  path: string;
  Component: React.ComponentType<any>;
}

export interface RemixParameters<TLoader> {
  remix: {
    initialPath: string;
    loaderData: TLoader;
    routePattern?: string;
    routeId?: string;
    routes?: Route[];
    userId?: string;
    sessionId?: string;
    pageSessionId?: string;
  };
}

export const withRemix = <TLoader extends Record<string, unknown>>() => {
  return (StoryFn: StoryFn, context: StoryContext) => {
    const remixParams = context.parameters
      ?.remix as RemixParameters<TLoader>["remix"];

    if (!remixParams) {
      throw new Error(
        "Remix parameters are required. Add them to your story parameters."
      );
    }

    const RemixStub = createRemixStub(
      [
        {
          id: remixParams.routeId || "root",
          path: remixParams.routePattern || "/",
          loader: () => remixParams.loaderData,
          Component: () => <StoryFn />,
        },
        ...(remixParams.routes || []),
      ],
      {
        env: {} as any,
        userId: "test-user-id",
        sessionId: "test-session-id",
        pageSessionId: "test-page-session-id",
      }
    );

    return <RemixStub initialEntries={[remixParams.initialPath]} />;
  };
};
