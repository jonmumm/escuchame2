import { z } from "zod";
import { StructuredObjectModel } from "./structured-object-model";

interface ResponseInput {
  transcribedText: string;
  conversationHistory: {
    role: "assistant" | "user";
    content: string;
  }[];
  targetLanguage: string;
  speechMetadata?: {
    fluency: number;      // 0-1 scale
    confidence: number;   // 0-1 scale
    troubledWords: string[];
    notes: string;
  };
}

const responseSchema = z.object({
  nextResponse: z.string(),
});

type ResponseOutput = z.infer<typeof responseSchema>;

export class ResponseGenerator extends StructuredObjectModel<ResponseInput, ResponseOutput> {
  protected getSchema() {
    return responseSchema;
  }

  protected async getSystemMessage(input: ResponseInput): Promise<string> {
    const fluencyLevel = input.speechMetadata?.fluency 
      ? input.speechMetadata.fluency < 0.3 ? "beginner"
        : input.speechMetadata.fluency < 0.6 ? "intermediate"
        : "advanced"
      : "unknown";

    return `You are an AI language learning assistant having a conversation in ${input.targetLanguage}.

Learner Profile:
${input.speechMetadata ? `
- Fluency Level: ${fluencyLevel} (${input.speechMetadata.fluency}/1.0)
- Confidence Level: ${input.speechMetadata.confidence}/1.0
- Troubled Words: ${input.speechMetadata.troubledWords.join(", ")}
- Speech Pattern Notes: ${input.speechMetadata.notes}
` : "- No speech metadata available"}

Important requirements:
1. Adapt your response to match the learner's demonstrated level
2. Use simple structures for low fluency/confidence, gradually increase complexity
3. Reinforce correct usage of troubled words when appropriate
4. Maintain conversation flow while providing gentle corrections
5. Use only ${input.targetLanguage} - no translations
6. Create natural opportunities for practice
7. Match the formality level shown in the conversation
8. Keep responses encouraging and supportive

Previous conversation:
${input.conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`;
  }

  protected async getUserMessage(input: ResponseInput): Promise<string> {
    return `Latest user message: "${input.transcribedText}"

Generate the next response that:
1. Maintains natural conversation flow
2. Provides implicit corrections if needed
3. Uses vocabulary slightly above user's level
4. Creates opportunities for the user to respond
5. Stays authentic to the scenario

Format the response as a JSON object with a "nextResponse" field containing only the message in ${input.targetLanguage}.`;
  }

  protected getName(): string {
    return "GENERATE_RESPONSE";
  }
} 