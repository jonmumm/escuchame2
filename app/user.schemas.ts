import { z } from "zod";

export const UserClientEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("CREATE_SCENARIO"),
    scenarioId: z.string(),
    payload: z.object({
      id: z.string(),
      type: z.enum(['template', 'custom', 'lucky']),
      nativeLanguage: z.string(),
      targetLanguage: z.string(),
      prompt: z.string(),
      timestamp: z.string()
    })
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
