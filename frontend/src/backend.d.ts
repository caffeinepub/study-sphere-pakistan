import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface PdfEntryInput {
    url: string;
    title: string;
    entryType: string;
}
export interface ChapterSnapshot {
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
    audioMimeType2: string;
    createdAt: bigint;
    audioBlob2?: ExternalBlob;
    audioMimeType: string;
    audioBlob?: ExternalBlob;
    audioUrl: string;
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
    audioMimeType2: string;
    audioMimeType: string;
    audioUrl: string;
    notesUrl: string;
    quizQuestions: string;
    flashcards: string;
}
export interface backendInterface {
    addChapter(input: ChapterInput): Promise<bigint>;
    addPdfEntry(input: PdfEntryInput): Promise<bigint>;
    deleteAudioData(chapterId: bigint): Promise<boolean>;
    deleteAudioData2(chapterId: bigint): Promise<boolean>;
    deleteChapter(id: bigint): Promise<boolean>;
    deletePdfEntry(id: bigint): Promise<boolean>;
    finalizeAudioUpload(chapterId: bigint, totalChunks: bigint): Promise<boolean>;
    finalizeAudioUpload2(chapterId: bigint, totalChunks: bigint): Promise<boolean>;
    getAllChapters(): Promise<Array<ChapterSnapshot>>;
    getAllPdfEntries(): Promise<Array<PdfEntry>>;
    getAudioData(chapterId: bigint): Promise<Uint8Array | null>;
    getAudioData2(chapterId: bigint): Promise<Uint8Array | null>;
    getChapter(id: bigint): Promise<ChapterSnapshot | null>;
    updateChapter(id: bigint, input: ChapterInput): Promise<boolean>;
    updatePdfEntry(id: bigint, input: PdfEntryInput): Promise<boolean>;
    uploadAudioChunk(chapterId: bigint, chunkIndex: bigint, totalChunks: bigint, data: Uint8Array): Promise<boolean>;
    uploadAudioChunk2(chapterId: bigint, chunkIndex: bigint, totalChunks: bigint, data: Uint8Array): Promise<boolean>;
}
