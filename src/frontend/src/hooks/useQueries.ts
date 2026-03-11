import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TopicInput } from "../backend";
import type { Chapter, PdfEntry, Topic } from "../types/chapter";
import {
  mapBackendChapter,
  mapBackendPdfEntry,
  mapBackendTopic,
} from "../utils/chapterMapper";
import { useActor } from "./useActor";

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
    mutationFn: async ({
      title,
      classNumber,
      subject,
    }: {
      title: string;
      classNumber: string;
      subject: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      const id = await actor.addChapter(title, classNumber, subject);
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
    mutationFn: async ({
      id,
      title,
      classNumber,
      subject,
    }: {
      id: string;
      title: string;
      classNumber: string;
      subject: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.updateChapter(BigInt(id), title, classNumber, subject);
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

// ─── Topics ───────────────────────────────────────────────────────────────────

export function useGetTopicsByChapter(chapterId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Topic[]>({
    queryKey: ["topics", chapterId],
    queryFn: async () => {
      if (!actor || !chapterId) return [];
      const result = await actor.getTopicsByChapter(BigInt(chapterId));
      return result.map(mapBackendTopic);
    },
    enabled: !!actor && !isFetching && !!chapterId,
  });
}

export function useGetTopic(id: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Topic | null>({
    queryKey: ["topic", id],
    queryFn: async () => {
      if (!actor || !id) return null;
      const result = await actor.getTopic(BigInt(id));
      if (!result) return null;
      return mapBackendTopic(result);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useAddTopic() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: TopicInput) => {
      if (!actor) throw new Error("Actor not initialized");
      const id = await actor.addTopic(input);
      return id.toString();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["topics", variables.chapterId.toString()],
      });
    },
  });
}

export function useUpdateTopic() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: TopicInput }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.updateTopic(BigInt(id), input);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["topics", variables.input.chapterId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["topic", variables.id] });
    },
  });
}

export function useDeleteTopic() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      chapterId: _chapterId,
    }: {
      id: string;
      chapterId: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.deleteTopic(BigInt(id));
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["topics", variables.chapterId],
      });
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
    mutationFn: async ({
      title,
      entryType,
      url,
    }: {
      title: string;
      entryType: string;
      url: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      const id = await actor.addPdfEntry(title, entryType, url);
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
    mutationFn: async ({
      id,
      title,
      entryType,
      url,
    }: {
      id: string;
      title: string;
      entryType: string;
      url: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.updatePdfEntry(BigInt(id), title, entryType, url);
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
