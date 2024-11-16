import { atom, map } from "nanostores";
import type { ScenarioTemplate, ScenarioSelection } from "../../routes/_index";

export function createHomepageStores() {
  return {
    isStarting$: atom(false),
    showMoreTemplates$: atom(false),
    customPrompt$: atom(""),
    scenarioSelection$: map<ScenarioSelection>({
      type: 'template',
      nativeLanguage: 'en',
      targetLanguage: 'es'
    }),
    selectedExtraTemplate$: atom<ScenarioTemplate | null>(null)
  };
}

export type HomepageStores = ReturnType<typeof createHomepageStores>; 