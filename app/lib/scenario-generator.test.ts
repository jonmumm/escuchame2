import { Observable } from "rxjs";
import { describe, expect, it } from "vitest";
import { ScenarioGenerator } from "./scenario-generator";
import type { ModelObservableEvent } from "./structured-object-model";

describe("ScenarioGenerator", () => {
  async function processStream(
    observable: Observable<ModelObservableEvent<string, { firstMessage: string }>>
  ): Promise<{ firstMessage: string }> {
    return new Promise((resolve, reject) => {
      observable.subscribe({
        next: (event) => {
          if (event.type === "GENERATE_SCENARIO_COMPLETE") {
            resolve(event.data);
          }
        },
        error: reject,
        complete: () => {/* ignore completion */}
      });
    });
  }

  const testScenarios = [
    { userIntent: "ordering coffee", targetLanguage: "es", name: "Spanish coffee shop" },
    { userIntent: "discuss AI technology", targetLanguage: "ja", name: "Japanese tech discussion" },
    { userIntent: "ordering food", targetLanguage: "fr", name: "French restaurant" },
    { userIntent: "buying train tickets", targetLanguage: "de", name: "German train station" },
    { userIntent: "asking for directions", targetLanguage: "it", name: "Italian directions" },
  ];

  // Test each scenario
  for (const scenario of testScenarios) {
    it(`should generate a valid ${scenario.name} scenario`, async () => {
      const generator = new ScenarioGenerator();
      const output = await processStream(
        generator.getObservable({
          userIntent: scenario.userIntent,
          targetLanguage: scenario.targetLanguage,
        })
      );

      console.log(`\n${scenario.name} output:`, output.firstMessage);

      // Basic validation only
      expect(output.firstMessage).toBeDefined();
      expect(typeof output.firstMessage).toBe("string");
      expect(output.firstMessage.length).toBeGreaterThan(0);
    });
  }
}); 