import { z } from "zod";

// Basic language and role enums
export const LanguageCode = z.enum(["es", "ja", "en"]);
export const Role = z.enum(["assistant", "user"]);

export const ScenarioTypeSchema = z.enum(["template", "custom", "lucky"]);

// Message schema for conversation history
export const Message = z.object({
  role: Role,
  content: z.string(),
  timestamp: z.date().optional(),
  id: z.string().optional(),
});

// Conversation history schema
export const ConversationHistory = z.array(Message);

// Scenario Generator Input/Output
export const ScenarioGeneratorInput = z.object({
  userIntent: z.string(),
  targetLanguage: LanguageCode,
});

export const ScenarioGeneratorOutput = z.object({
  firstMessage: z.string(),
});

// Response Generator Input/Output
export const GenerateResponseInput = z.object({
  transcribedText: z.string(),
  conversationHistory: ConversationHistory,
  targetLanguage: LanguageCode,
});

export const GenerateResponseOutput = z.object({
  nextResponse: z.string(),
});

// User Session/State
export const UserState = z.object({
  id: z.string(),
  currentLanguage: LanguageCode,
  activeConversationId: z.string().optional(),
});

// Conversation State
export const ConversationState = z.object({
  id: z.string(),
  userId: z.string(),
  targetLanguage: LanguageCode,
  scenario: z.string(),
  history: ConversationHistory,
  startedAt: z.date(),
  lastMessageAt: z.date().optional(),
  status: z.enum(["active", "completed"]),
});

// Speech-to-Text Result
export const SpeechToTextResult = z.object({
  transcribedText: z.string(),
  language: LanguageCode.optional(),
});

// Text-to-Speech Request
export const TextToSpeechRequest = z.object({
  text: z.string(),
  language: LanguageCode,
});

// Error Schema
export const ApiError = z.object({
  code: z.string(),
  message: z.string(),
});

// Types derived from schemas
export type LanguageCode = z.infer<typeof LanguageCode>;
export type Role = z.infer<typeof Role>;
export type Message = z.infer<typeof Message>;
export type ConversationHistory = z.infer<typeof ConversationHistory>;
export type ScenarioGeneratorInput = z.infer<typeof ScenarioGeneratorInput>;
export type ScenarioGeneratorOutput = z.infer<typeof ScenarioGeneratorOutput>;
export type GenerateResponseInput = z.infer<typeof GenerateResponseInput>;
export type GenerateResponseOutput = z.infer<typeof GenerateResponseOutput>;
export type UserState = z.infer<typeof UserState>;
export type ConversationState = z.infer<typeof ConversationState>;
export type SpeechToTextResult = z.infer<typeof SpeechToTextResult>;
export type TextToSpeechRequest = z.infer<typeof TextToSpeechRequest>;
export type ApiError = z.infer<typeof ApiError>;

export const StartConvserationPayloadSchema = z.object({
  id: z.string(),
  type: z.enum(["template", "custom", "lucky"]),
  nativeLanguage: z.string(),
  targetLanguage: z.string(),
  prompt: z.string(),
  timestamp: z.string(),
});
