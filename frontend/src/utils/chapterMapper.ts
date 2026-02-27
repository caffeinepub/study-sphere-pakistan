// Utility to map between backend ChapterSnapshot/PdfEntry types (bigint IDs, JSON strings)
// and the frontend Chapter/PdfEntry types (string IDs, parsed arrays).

import type { ChapterSnapshot, PdfEntry as BackendPdfEntry } from "../backend";
import type { Chapter, PdfEntry, QuizQuestion, FlashcardItem } from "../types/chapter";

function safeParseJson<T>(json: string, fallback: T): T {
  try {
    if (!json) return fallback;
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export function mapBackendChapter(bc: ChapterSnapshot): Chapter {
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
    audioLabel1: bc.audioLabel1 ?? "",
    audioLabel2: bc.audioLabel2 ?? "",
    audioUrl: bc.audioUrl,
    audioMimeType: bc.audioMimeType || "audio/mpeg",
    audioMimeType2: bc.audioMimeType2 ?? "",
    quizQuestions: safeParseJson<QuizQuestion[]>(bc.quizQuestions, []),
    flashcards: safeParseJson<FlashcardItem[]>(bc.flashcards, []),
    createdAt: Number(bc.createdAt),
    hasAudioBlob: bc.audioBlob !== undefined && bc.audioBlob !== null,
    hasAudioBlob2: bc.audioBlob2 !== undefined && bc.audioBlob2 !== null,
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
