// Canonical frontend types for chapters and PDF entries.
// These mirror the backend Motoko types but use string IDs for convenience in the UI.

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface FlashcardItem {
  front: string;
  back: string;
}

export interface TrueFalseQuestion {
  statement: string;
  answer: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  classNumber: string;
  subject: string;
  notesUrl: string;
  notesUrl1: string;
  notesLabel1: string;
  notesUrl2: string;
  notesUrl3: string;
  notesLabel3: string;
  notesLabel2: string;
  audioLabel1: string;
  audioLabel2: string;
  audioUrl1: string;
  audioUrl2: string;
  quizQuestions: QuizQuestion[];
  flashcards: FlashcardItem[];
  trueFalseQuestions: TrueFalseQuestion[];
  createdAt: number;
}

export interface PdfEntry {
  id: string;
  title: string;
  entryType: string;
  url: string;
}
