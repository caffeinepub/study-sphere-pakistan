import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TopicInput {
    title: string;
    notesLabel1: string;
    notesLabel2: string;
    audioLabel1: string;
    audioLabel2: string;
    notesUrl1: string;
    notesUrl2: string;
    chapterId: bigint;
    audioUrl1: string;
    audioUrl2: string;
    quizQuestions: string;
    flashcards: string;
    trueFalseQuestions: string;
}
export interface Topic {
    id: bigint;
    title: string;
    notesLabel1: string;
    notesLabel2: string;
    audioLabel1: string;
    audioLabel2: string;
    notesUrl1: string;
    notesUrl2: string;
    createdAt: bigint;
    chapterId: bigint;
    audioUrl1: string;
    audioUrl2: string;
    quizQuestions: string;
    flashcards: string;
    trueFalseQuestions: string;
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
    classNumber: string;
    subject: string;
    createdAt: bigint;
}
export interface backendInterface {
    addChapter(title: string, classNumber: string, subject: string): Promise<bigint>;
    addPdfEntry(title: string, entryType: string, url: string): Promise<bigint>;
    addTopic(input: TopicInput): Promise<bigint>;
    deleteChapter(id: bigint): Promise<boolean>;
    deletePdfEntry(id: bigint): Promise<boolean>;
    deleteTopic(id: bigint): Promise<boolean>;
    getAllChapters(): Promise<Array<Chapter>>;
    getAllPdfEntries(): Promise<Array<PdfEntry>>;
    getAllTopics(): Promise<Array<Topic>>;
    getChapter(id: bigint): Promise<Chapter | null>;
    getPdfEntry(id: bigint): Promise<PdfEntry | null>;
    getTopic(id: bigint): Promise<Topic | null>;
    getTopicsByChapter(chapterId: bigint): Promise<Array<Topic>>;
    updateChapter(id: bigint, title: string, classNumber: string, subject: string): Promise<boolean>;
    updatePdfEntry(id: bigint, title: string, entryType: string, url: string): Promise<boolean>;
    updateTopic(id: bigint, input: TopicInput): Promise<boolean>;
}
