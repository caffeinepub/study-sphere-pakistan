import type {
  Chapter as BackendChapter,
  PdfEntry as BackendPdfEntry,
  Topic as BackendTopic,
} from "../backend";
import type {
  Chapter,
  FlashcardItem,
  PdfEntry,
  QuizQuestion,
  Topic,
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
    createdAt: Number(bc.createdAt),
  };
}

export function mapBackendTopic(bt: BackendTopic): Topic {
  return {
    id: bt.id.toString(),
    chapterId: bt.chapterId.toString(),
    title: bt.title,
    notesUrl1: bt.notesUrl1 ?? "",
    notesLabel1: bt.notesLabel1 ?? "",
    notesUrl2: bt.notesUrl2 ?? "",
    notesLabel2: bt.notesLabel2 ?? "",
    audioUrl1: bt.audioUrl1 ?? "",
    audioLabel1: bt.audioLabel1 ?? "",
    audioUrl2: bt.audioUrl2 ?? "",
    audioLabel2: bt.audioLabel2 ?? "",
    quizQuestions: safeParseJson<QuizQuestion[]>(bt.quizQuestions, []),
    flashcards: safeParseJson<FlashcardItem[]>(bt.flashcards, []),
    trueFalseQuestions: safeParseJson<TrueFalseQuestion[]>(
      bt.trueFalseQuestions,
      [],
    ),
    createdAt: Number(bt.createdAt),
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
