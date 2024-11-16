import { atom } from "nanostores";

export const isStarting$ = atom(false);
export const showMoreTemplates$ = atom(false);
export const customPrompt$ = atom("");

export function setStarting(isStarting: boolean) {
  isStarting$.set(isStarting);
}

export function setShowMoreTemplates(show: boolean) {
  showMoreTemplates$.set(show);
}

export function setCustomPrompt(prompt: string) {
  customPrompt$.set(prompt);
} 