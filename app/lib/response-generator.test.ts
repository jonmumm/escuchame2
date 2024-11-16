import { Observable } from "rxjs";
import { describe, expect, it } from "vitest";
import { ResponseGenerator } from "./response-generator";
import type { ModelObservableEvent } from "./structured-object-model";

describe("ResponseGenerator", () => {
  async function processStream(
    observable: Observable<ModelObservableEvent<string, { nextResponse: string }>>
  ): Promise<{ nextResponse: string }> {
    return new Promise((resolve, reject) => {
      observable.subscribe({
        next: (event) => {
          if (event.type === "GENERATE_RESPONSE_COMPLETE") {
            resolve(event.data);
          }
        },
        error: reject,
        complete: () => {/* ignore completion */}
      });
    });
  }

  const testConversations = [
    {
      name: "Spanish coffee order",
      transcribedText: "quiero un cafe con leche por favor",
      speechMetadata: {
        fluency: 0.4,
        confidence: 0.5,
        troubledWords: ["quiero", "leche"],
        notes: "Stress pattern issues on 'quiero', unclear pronunciation of 'leche'"
      },
      conversationHistory: [
        {
          role: "assistant" as const,
          content: "¡Hola! Bienvenido a Café Madrid. ¿Qué te gustaría tomar?"
        },
        {
          role: "user" as const,
          content: "quiero un cafe con leche por favor",
          speechMetadata: {
            fluency: 0.4,
            confidence: 0.5,
            troubledWords: ["quiero", "leche"],
            notes: "Stress pattern issues on 'quiero', unclear pronunciation of 'leche'"
          }
        }
      ],
      targetLanguage: "es"
    },
    {
      name: "Japanese tech discussion",
      transcribedText: "hai AI no kaihatsu ni kyoumi ga arimasu",
      speechMetadata: {
        fluency: 0.3,
        confidence: 0.4,
        troubledWords: ["kaihatsu", "kyoumi"],
        notes: "Incorrect pitch accent on 'kaihatsu', flat intonation throughout"
      },
      conversationHistory: [
        {
          role: "assistant" as const,
          content: "こんにちは！テクノロジーについて話しましょう。AIに興味がありますか？"
        },
        {
          role: "user" as const,
          content: "hai AI no kaihatsu ni kyoumi ga arimasu",
          speechMetadata: {
            fluency: 0.3,
            confidence: 0.4,
            troubledWords: ["kaihatsu", "kyoumi"],
            notes: "Incorrect pitch accent on 'kaihatsu', flat intonation throughout"
          }
        }
      ],
      targetLanguage: "ja"
    },
    {
      name: "French restaurant order",
      transcribedText: "je voudrais une table pour deux personnes sil vous plait",
      speechMetadata: {
        fluency: 0.5,
        confidence: 0.6,
        troubledWords: ["voudrais", "deux"],
        notes: "Difficulty with French 'r' sound, incorrect vowel sound in 'deux'"
      },
      conversationHistory: [
        {
          role: "assistant" as const,
          content: "Bonjour! Bienvenue au restaurant Le Château. Je peux vous aider?"
        },
        {
          role: "user" as const,
          content: "je voudrais une table pour deux personnes sil vous plait",
          speechMetadata: {
            fluency: 0.5,
            confidence: 0.6,
            troubledWords: ["voudrais", "deux"],
            notes: "Difficulty with French 'r' sound, incorrect vowel sound in 'deux'"
          }
        }
      ],
      targetLanguage: "fr"
    }
  ];

  // Test each conversation
  for (const conversation of testConversations) {
    it(`should generate a valid response for ${conversation.name}`, async () => {
      const generator = new ResponseGenerator();
      const output = await processStream(
        generator.getObservable({
          transcribedText: conversation.transcribedText,
          conversationHistory: conversation.conversationHistory,
          targetLanguage: conversation.targetLanguage,
          speechMetadata: conversation.speechMetadata
        })
      );

      console.log(`\n${conversation.name} output:`, output.nextResponse);

      // Basic validation only
      expect(output.nextResponse).toBeDefined();
      expect(typeof output.nextResponse).toBe("string");
      expect(output.nextResponse.length).toBeGreaterThan(0);
    });
  }
}); 