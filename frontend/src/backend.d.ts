import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PdfEntryInput {
    url: string;
    title: string;
    entryType: string;
}
export interface ChapterInput {
    title: string;
    notesLabel1: string;
    notesLabel2: string;
    audioLabel1: string;
    audioLabel2: string;
    classNumber: string;
    notesUrl1: string;
    notesUrl2: string;
    subject: string;
    audioUrl1: string;
    audioUrl2: string;
    notesUrl: string;
    quizQuestions: string;
    flashcards: string;
}
export interface PdfEntry {
    id: bigint;
    url: string;
    title: string;
    entryType: string;
}
export interface Chapter {
    id: bigint;
    title: string;
    notesLabel1: string;
    notesLabel2: string;
    audioLabel1: string;
    audioLabel2: string;
    classNumber: string;
    notesUrl1: string;
    notesUrl2: string;
    subject: string;
    createdAt: bigint;
    audioUrl1: string;
    audioUrl2: string;
    notesUrl: string;
    quizQuestions: string;
    flashcards: string;
}
export interface backendInterface {
    addChapter(input: ChapterInput): Promise<bigint>;
    addPdfEntry(input: PdfEntryInput): Promise<bigint>;
    deleteChapter(id: bigint): Promise<boolean>;
    deletePdfEntry(id: bigint): Promise<boolean>;
    getAllChapters(): Promise<Array<Chapter>>;
    getAllPdfEntries(): Promise<Array<PdfEntry>>;
    getChapter(id: bigint): Promise<Chapter | null>;
    updateChapter(id: bigint, input: ChapterInput): Promise<boolean>;
    updatePdfEntry(id: bigint, input: PdfEntryInput): Promise<boolean>;
}
