// Utility to map between backend Chapter/PdfEntry types (bigint IDs, JSON strings)
// and the frontend Chapter/PdfEntry types (string IDs, parsed arrays).

import type {
  Chapter as BackendChapter,
  PdfEntry as BackendPdfEntry,
} from "../backend";
import type {
  Chapter,
  FlashcardItem,
  PdfEntry,
  QuizQuestion,
  TrueFalseQuestion,
} from "../types/chapter";

function safeParseJson<T>(json: string, fallback: T): T {
  try {
    if (!json) return fallback;
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export function mapBackendChapter(bc: BackendChapter): Chapter {
  return {
    id: bc.id.toString(),
    title: bc.title,
    classNumber: bc.classNumber,
    subject: bc.subject,
    notesUrl: bc.notesUrl,
    notesUrl1: bc.notesUrl1 ?? "",
    notesLabel1: bc.notesLabel1 ?? "",
    notesUrl2: bc.notesUrl2 ?? "",
    notesLabel2: bc.notesLabel2 ?? "",
    notesUrl3: (bc as any).notesUrl3 ?? "",
    notesLabel3: (bc as any).notesLabel3 ?? "",
    audioLabel1: bc.audioLabel1 ?? "",
    audioLabel2: bc.audioLabel2 ?? "",
    audioUrl1: bc.audioUrl1 ?? "",
    audioUrl2: bc.audioUrl2 ?? "",
    quizQuestions: safeParseJson<QuizQuestion[]>(bc.quizQuestions, []),
    flashcards: safeParseJson<FlashcardItem[]>(bc.flashcards, []),
    trueFalseQuestions: safeParseJson<TrueFalseQuestion[]>(
      bc.trueFalseQuestions,
      [],
    ),
    createdAt: Number(bc.createdAt),
  };
}

export function mapBackendPdfEntry(bp: BackendPdfEntry): PdfEntry {
  return {
    id: bp.id.toString(),
    title: bp.title,
    entryType: bp.entryType,
    url: bp.url,
  };
}
