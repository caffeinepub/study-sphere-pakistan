import type { FlashcardItem, QuizQuestion } from "../types/chapter";

export interface ValidationResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

export function validateQuizJSON(raw: string): ValidationResult {
  if (!raw.trim()) return { success: true, data: [] };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      success: false,
      error: "Invalid JSON format. Please check your syntax.",
    };
  }
  if (!Array.isArray(parsed)) {
    return {
      success: false,
      error: "Quiz JSON must be an array of question objects.",
    };
  }
  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i] as Record<string, unknown>;
    if (typeof item !== "object" || item === null) {
      return { success: false, error: `Item at index ${i} must be an object.` };
    }
    if (typeof item.question !== "string" || !item.question.trim()) {
      return {
        success: false,
        error: `Item at index ${i} must have a "question" string field.`,
      };
    }
    if (!Array.isArray(item.options) || item.options.length < 2) {
      return {
        success: false,
        error: `Item at index ${i} must have an "options" array with at least 2 items.`,
      };
    }
    for (let j = 0; j < item.options.length; j++) {
      if (typeof item.options[j] !== "string") {
        return {
          success: false,
          error: `Item at index ${i}, option ${j} must be a string.`,
        };
      }
    }
    if (
      typeof item.correctIndex !== "number" ||
      item.correctIndex < 0 ||
      item.correctIndex >= item.options.length
    ) {
      return {
        success: false,
        error: `Item at index ${i} must have a valid "correctIndex" number (0 to ${(item.options as unknown[]).length - 1}).`,
      };
    }
  }
  return { success: true, data: parsed as QuizQuestion[] };
}

export function validateFlashcardJSON(raw: string): ValidationResult {
  if (!raw.trim()) return { success: true, data: [] };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      success: false,
      error: "Invalid JSON format. Please check your syntax.",
    };
  }
  if (!Array.isArray(parsed)) {
    return {
      success: false,
      error: "Flashcard JSON must be an array of card objects.",
    };
  }
  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i] as Record<string, unknown>;
    if (typeof item !== "object" || item === null) {
      return { success: false, error: `Item at index ${i} must be an object.` };
    }
    if (typeof item.front !== "string" || !item.front.trim()) {
      return {
        success: false,
        error: `Item at index ${i} must have a "front" string field.`,
      };
    }
    if (typeof item.back !== "string" || !item.back.trim()) {
      return {
        success: false,
        error: `Item at index ${i} must have a "back" string field.`,
      };
    }
  }
  return { success: true, data: parsed as FlashcardItem[] };
}

export const QUIZ_JSON_EXAMPLE = `[
  {
    "question": "What is the powerhouse of the cell?",
    "options": ["Nucleus", "Mitochondria", "Ribosome", "Golgi Body"],
    "correctIndex": 1
  }
]`;

export const FLASHCARD_JSON_EXAMPLE = `[
  {
    "front": "What is photosynthesis?",
    "back": "The process by which plants use sunlight, water and CO2 to produce oxygen and energy in the form of sugar."
  }
]`;
