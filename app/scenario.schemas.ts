import { z } from "zod";

export const ScenarioClientEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("AUDIO_CHUNK_APPEND"),
    audio: z.string(), // base64 encoded audio chunk
  }),
  z.object({
    type: z.literal("AUDIO_CHUNK_COMMIT")
  }),
  z.object({
    type: z.literal("GENERATE_RESPONSE")
  }),
]);

export const ScenarioServiceEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("NEW_MESSAGE"),
    content: z.string(),
  }),
  z.object({
    type: z.literal("AUDIO_BUFFER_CLEARED")
  }),
  z.object({
    type: z.literal("RESPONSE_STARTED")
  }),
  z.object({
    type: z.literal("RESPONSE_COMPLETED"),
    audio: z.string(), // base64 encoded audio response
  }),
]);

export const ScenarioInputPropsSchema = z.object({
  audioBuffer: z.array(z.string()).optional(), // Array of base64 audio chunks
});
