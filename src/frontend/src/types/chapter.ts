// Canonical frontend types for chapters, topics and PDF entries.

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
  createdAt: number;
}

export interface Topic {
  id: string;
  chapterId: string;
  title: string;
  notesUrl1: string;
  notesLabel1: string;
  notesUrl2: string;
  notesLabel2: string;
  audioUrl1: string;
  audioLabel1: string;
  audioUrl2: string;
  audioLabel2: string;
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
