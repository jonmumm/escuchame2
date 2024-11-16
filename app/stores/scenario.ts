import { atom, map } from "nanostores";

export type ScenarioTemplate = {
  title: string;
  description: string;
  icon: string;
};

export type ScenarioSelection = {
  type: 'template' | 'custom' | 'lucky';
  template?: ScenarioTemplate;
  customPrompt?: string;
  nativeLanguage: string;
  targetLanguage: string;
};

// Store for the current selection
export const scenarioSelection$ = map<ScenarioSelection>({
  type: 'template',
  nativeLanguage: 'en',
  targetLanguage: 'es'
});

// Add a new store to track if a template from "more" was selected
export const selectedExtraTemplate$ = atom<ScenarioTemplate | null>(null);

// Helper functions to update the store
export function selectTemplate(template: ScenarioTemplate, isExtra: boolean = false) {
  scenarioSelection$.set({
    ...scenarioSelection$.get(),
    type: 'template',
    template,
    customPrompt: undefined
  });
  
  if (isExtra) {
    selectedExtraTemplate$.set(template);
  }
}

export function selectCustom(prompt: string) {
  if (prompt.trim()) {
    scenarioSelection$.set({
      ...scenarioSelection$.get(),
      type: 'custom',
      customPrompt: prompt,
      template: undefined
    });
  }
}

export function selectLucky() {
  scenarioSelection$.set({
    ...scenarioSelection$.get(),
    type: 'lucky',
    template: undefined,
    customPrompt: undefined
  });
}

export function setLanguages(nativeLanguage: string, targetLanguage: string) {
  scenarioSelection$.setKey('nativeLanguage', nativeLanguage);
  scenarioSelection$.setKey('targetLanguage', targetLanguage);
} 