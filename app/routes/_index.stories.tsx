import { expect } from "@storybook/jest";
import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "@storybook/testing-library";
import { withActorKit } from "actor-kit/storybook";
import { withRemix } from "../test/remix-stub";
import { UserContext } from "../app/user.context";
import type { UserMachine } from "../app/user.machine";
import Homepage from "../app/routes/_index";

const defaultParameters = {
  remix: {
    initialPath: "/",
    loaderData: {},
    userId: "test-user-id",
    sessionId: "test-session-id",
    pageSessionId: "test-page-session-id",
    routes: [],
  },
  actorKit: {
    user: {
      "test-session": {
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
      },
    },
  },
};

const meta = {
  title: "Pages/Homepage",
  component: Homepage,
  parameters: defaultParameters,
  decorators: [
    withRemix<{}>(),
    withActorKit<UserMachine>({
      actorType: "user",
      context: UserContext,
    }),
  ],
} satisfies Meta<typeof Homepage>;

export default meta;
type Story = StoryObj<typeof Homepage>;

// Stories with different states
export const Default: Story = {
  parameters: defaultParameters,
};

export const WithSelectedTemplate: Story = {
  parameters: defaultParameters,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Click a template card
    const cafeTemplate = await canvas.findByText("At the Café");
    await userEvent.click(cafeTemplate);
  },
};

export const WithCustomPrompt: Story = {
  parameters: defaultParameters,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Type in custom prompt
    const textarea = await canvas.findByPlaceholderText(/Example:/i);
    await userEvent.type(textarea, "I want to practice ordering coffee");
  },
};

export const WithTemplatesDrawerOpen: Story = {
  parameters: defaultParameters,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Click more templates button
    const moreTemplatesButton = await canvas.findByTestId(
      "more-templates-button"
    );
    await userEvent.click(moreTemplatesButton);
  },
};

export const TemplatesDrawerInteraction: Story = {
  parameters: defaultParameters,
  play: async ({ canvasElement }) => {
    // Use document.body for portal content
    const canvas = within(document.body);
    const mainCanvas = within(canvasElement);

    // Click more templates button
    const moreTemplatesButton = await mainCanvas.findByTestId(
      "more-templates-button"
    );
    await userEvent.click(moreTemplatesButton);

    // Wait for drawer content
    const drawer = await canvas.findByTestId("templates-drawer");
    expect(drawer).toBeInTheDocument();

    // Find and click the doctor template
    const doctorTemplate = await within(drawer).findByTestId(
      "template-at-the-doctor"
    );
    await userEvent.click(doctorTemplate);

    // Verify template is selected (it should appear in the main list)
    const selectedTemplate = await mainCanvas.findByText("At the Doctor");
    expect(selectedTemplate).toBeInTheDocument();
  },
};

export const ErrorAndRetry: Story = {
  parameters: defaultParameters,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Select a template
    const cafeTemplate = await canvas.findByText("At the Café");
    await userEvent.click(cafeTemplate);

    // Get initial start button
    const startButton = await canvas.findByRole("button", {
      name: /start conversation/i,
    });
    await userEvent.click(startButton);

    // Initial loading state
    expect(startButton).toHaveTextContent("Starting...");
    expect(startButton).toBeDisabled();

    // Wait for error toast to appear (after 5s timeout)
    const errorToast = await canvas.findByText(
      "Failed to create conversation",
      {},
      { timeout: 6000 }
    );
    expect(errorToast).toBeInTheDocument();

    // Find and click retry button in the toast
    const retryButton = await canvas.findByRole("button", { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    // Click retry and verify we go back to loading state
    await userEvent.click(retryButton);
    const loadingButton = await canvas.findByRole("button", {
      name: /starting conversation/i,
    });
    expect(loadingButton).toBeDisabled();
    expect(loadingButton).toHaveTextContent("Starting...");

    // Wait for second error toast
    const secondErrorToast = await canvas.findByText(
      "Failed to create conversation",
      {},
      { timeout: 6000 }
    );
    expect(secondErrorToast).toBeInTheDocument();
  },
};
