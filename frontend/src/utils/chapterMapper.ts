// Utility to map between backend Chapter/PdfEntry types (bigint IDs, JSON strings)
// and the frontend Chapter/PdfEntry types (string IDs, parsed arrays).

import type { Chapter as BackendChapter, PdfEntry as BackendPdfEntry } from '../backend';
import type { Chapter, PdfEntry, QuizQuestion, FlashcardItem } from '../types/chapter';

export function mapBackendChapter(bc: BackendChapter): Chapter {
  let quizQuestions: QuizQuestion[] = [];
  let flashcards: FlashcardItem[] = [];

  try {
    if (bc.quizQuestions) {
      quizQuestions = JSON.parse(bc.quizQuestions);
    }
  } catch {
    quizQuestions = [];
  }

  try {
    if (bc.flashcards) {
      flashcards = JSON.parse(bc.flashcards);
    }
  } catch {
    flashcards = [];
  }

  return {
    id: bc.id.toString(),
    title: bc.title,
    classNumber: bc.classNumber,
    subject: bc.subject,
    notesUrl: bc.notesUrl,
    audioUrl: bc.audioUrl,
    quizQuestions,
    flashcards,
    createdAt: Number(bc.createdAt),
  };
}

export function mapBackendPdfEntry(bp: BackendPdfEntry): PdfEntry {
  return {
    id: bp.id.toString(),
    title: bp.title,
    entryType: bp.entryType as 'past-paper' | 'practice-test',
    url: bp.url,
  };
}
