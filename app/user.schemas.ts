import { z } from "zod";
import { StartConvserationPayloadSchema } from "./schemas";

export const UserClientEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("CREATE_SCENARIO"),
    scenarioId: z.string(),
    payload: StartConvserationPayloadSchema,
  }),
]);

export const UserServiceEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("SYNC"),
  }),
]);

export const UserInputPropsSchema = z.object({
  sessionId: z.string(),
});
