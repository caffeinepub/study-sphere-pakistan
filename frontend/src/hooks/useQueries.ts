import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Chapter, ChapterInput, PdfEntry, PdfEntryInput } from '../backend';

// ─── Chapters ────────────────────────────────────────────────────────────────

export function useGetAllChapters() {
  const { actor, isFetching } = useActor();
  return useQuery<Chapter[]>({
    queryKey: ['chapters'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllChapters();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetChapter(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Chapter | null>({
    queryKey: ['chapter', id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getChapter(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useAddChapter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ChapterInput) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addChapter(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
    },
  });
}

export function useUpdateChapter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: bigint; input: ChapterInput }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateChapter(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
    },
  });
}

export function useDeleteChapter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.deleteChapter(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
    },
  });
}

// ─── PDF Entries ──────────────────────────────────────────────────────────────

export function useGetAllPdfEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<PdfEntry[]>({
    queryKey: ['pdfEntries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPdfEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddPdfEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: PdfEntryInput) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addPdfEntry(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pdfEntries'] });
    },
  });
}

export function useUpdatePdfEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: bigint; input: PdfEntryInput }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updatePdfEntry(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pdfEntries'] });
    },
  });
}

export function useDeletePdfEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.deletePdfEntry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pdfEntries'] });
    },
  });
}
