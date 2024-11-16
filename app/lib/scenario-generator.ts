import { z } from "zod";
import { StructuredObjectModel } from "./structured-object-model";

// Input type for the scenario generator
interface ScenarioInput {
  userIntent: string;
  targetLanguage: string;
}

// Output schema for the generated scenario
const scenarioSchema = z.object({
  firstMessage: z.string(),
});

type ScenarioOutput = z.infer<typeof scenarioSchema>;

export class ScenarioGenerator extends StructuredObjectModel<ScenarioInput, ScenarioOutput> {
  protected getSchema() {
    return scenarioSchema;
  }

  protected async getSystemMessage(input: ScenarioInput): Promise<string> {
    return `You are an AI language learning assistant initiating a conversation in ${input.targetLanguage}.
Your task is to generate a natural, contextually appropriate first message for a language learning scenario.

Important requirements:
1. ALWAYS start with a standard greeting (e.g., "Hola" for Spanish, "Bonjour" for French)
2. Keep the message simple and focused on the scenario
3. End with a clear question that invites response
4. Use only ${input.targetLanguage} - no translations or explanations
5. Stay in character for the scenario
6. Use formal language unless the scenario specifically calls for informal

For greetings, use:
- Spanish: "Hola" or "Buenos días"
- French: "Bonjour" or "Bonsoir"
- Japanese: "こんにちは" or "はじめまして"`;
  }

  protected async getUserMessage(input: ScenarioInput): Promise<string> {
    return `Generate a natural opening message for a conversation about: "${input.userIntent}"

The message must:
1. Start with an appropriate greeting for ${input.targetLanguage}
2. Set up the scenario naturally
3. End with a question that encourages response
4. Be appropriate for a language learning context
5. Use simple, clear language

Format the response as a JSON object with a "firstMessage" field containing only the message in ${input.targetLanguage}.`;
  }

  protected getName(): string {
    return "GENERATE_SCENARIO";
  }
} 