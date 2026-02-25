// Canonical frontend types for chapters and PDF entries.
// These mirror the backend Motoko types but use number IDs for convenience in the UI.

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface FlashcardItem {
  front: string;
  back: string;
}

export interface Chapter {
  id: string;
  title: string;
  classNumber: string;
  subject: string;
  notesUrl: string;
  audioUrl: string;
  quizQuestions: QuizQuestion[];
  flashcards: FlashcardItem[];
  createdAt?: number;
}

export interface PdfEntry {
  id: string;
  title: string;
  entryType: 'past-paper' | 'practice-test';
  url: string;
}
