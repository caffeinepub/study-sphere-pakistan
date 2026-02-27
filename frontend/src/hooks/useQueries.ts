import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type { ChapterInput, PdfEntryInput } from "../backend";
import { mapBackendChapter, mapBackendPdfEntry } from "../utils/chapterMapper";
import type { Chapter, PdfEntry } from "../types/chapter";

// ─── Chapters ─────────────────────────────────────────────────────────────────

export function useGetAllChapters() {
  const { actor, isFetching } = useActor();

  return useQuery<Chapter[]>({
    queryKey: ["chapters"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllChapters();
      return result.map(mapBackendChapter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetChapter(id: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Chapter | null>({
    queryKey: ["chapter", id],
    queryFn: async () => {
      if (!actor || !id) return null;
      const result = await actor.getChapter(BigInt(id));
      if (!result) return null;
      return mapBackendChapter(result);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useAddChapter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ChapterInput) => {
      if (!actor) throw new Error("Actor not initialized");
      const id = await actor.addChapter(input);
      return id.toString();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
    },
  });
}

export function useUpdateChapter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ChapterInput }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.updateChapter(BigInt(id), input);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      queryClient.invalidateQueries({ queryKey: ["chapter", variables.id] });
    },
  });
}

export function useDeleteChapter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.deleteChapter(BigInt(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
    },
  });
}

// ─── PDF Entries ──────────────────────────────────────────────────────────────

export function useGetAllPdfEntries() {
  const { actor, isFetching } = useActor();

  return useQuery<PdfEntry[]>({
    queryKey: ["pdfEntries"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllPdfEntries();
      return result.map(mapBackendPdfEntry);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddPdfEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PdfEntryInput) => {
      if (!actor) throw new Error("Actor not initialized");
      const id = await actor.addPdfEntry(input);
      return id.toString();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdfEntries"] });
    },
  });
}

export function useUpdatePdfEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: PdfEntryInput }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.updatePdfEntry(BigInt(id), input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdfEntries"] });
    },
  });
}

export function useDeletePdfEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.deletePdfEntry(BigInt(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdfEntries"] });
    },
  });
}
