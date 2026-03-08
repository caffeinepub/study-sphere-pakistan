import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import ChapterForm from "../components/ChapterForm";
import PdfEntryForm from "../components/PdfEntryForm";
import {
  useDeleteChapter,
  useDeletePdfEntry,
  useGetAllChapters,
  useGetAllPdfEntries,
} from "../hooks/useQueries";
import type { Chapter, PdfEntry } from "../types/chapter";

type AdminView = "list" | "addChapter" | "editChapter" | "addPdf" | "editPdf";

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("chapters");
  const [view, setView] = useState<AdminView>("list");
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [editingPdf, setEditingPdf] = useState<PdfEntry | null>(null);

  const {
    data: chapters,
    isLoading: chaptersLoading,
    isError: chaptersError,
  } = useGetAllChapters();
  const {
    data: pdfEntries,
    isLoading: pdfsLoading,
    isError: pdfsError,
  } = useGetAllPdfEntries();
  const deleteChapterMutation = useDeleteChapter();
  const deletePdfMutation = useDeletePdfEntry();

  const chapterList = chapters ?? [];
  const pdfList = pdfEntries ?? [];

  const handleDeleteChapter = async (id: string) => {
    await deleteChapterMutation.mutateAsync(id);
  };

  const handleDeletePdf = async (id: string) => {
    await deletePdfMutation.mutateAsync(id);
  };

  const handleChapterSaved = () => {
    setView("list");
    setEditingChapter(null);
  };

  const handlePdfSaved = () => {
    setView("list");
    setEditingPdf(null);
  };

  // ── Chapter Form view ──────────────────────────────────────────────────────
  if (view === "addChapter" || view === "editChapter") {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setView("list");
                setEditingChapter(null);
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">
              {view === "editChapter" ? "Edit Chapter" : "Add Chapter"}
            </h1>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-6">
          <ChapterForm
            chapter={editingChapter ?? undefined}
            onSuccess={handleChapterSaved}
            onCancel={() => {
              setView("list");
              setEditingChapter(null);
            }}
          />
        </main>
      </div>
    );
  }

  // ── PDF Form view ──────────────────────────────────────────────────────────
  if (view === "addPdf" || view === "editPdf") {
    return (
      <PdfEntryForm
        entry={editingPdf ?? undefined}
        onSave={handlePdfSaved}
        onCancel={() => {
          setView("list");
          setEditingPdf(null);
        }}
      />
    );
  }

  // ── Main list view ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/" })}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">
              Manage chapters and PDF entries
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="chapters" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Chapters
              {chapterList.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {chapterList.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pdfs" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              PDF Entries
              {pdfList.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pdfList.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Chapters Tab */}
          <TabsContent value="chapters">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                All Chapters
              </h2>
              <Button
                onClick={() => {
                  setEditingChapter(null);
                  setView("addChapter");
                }}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Chapter
              </Button>
            </div>

            {chaptersLoading && (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders are positional
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            )}

            {chaptersError && (
              <div className="flex items-center gap-2 text-destructive py-8 justify-center">
                <AlertCircle className="w-5 h-5" />
                <span>Failed to load chapters.</span>
              </div>
            )}

            {!chaptersLoading && !chaptersError && chapterList.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No chapters yet. Add your first chapter!</p>
              </div>
            )}

            {!chaptersLoading && !chaptersError && chapterList.length > 0 && (
              <div className="space-y-3">
                {chapterList.map((chapter) => (
                  <div
                    key={chapter.id}
                    className="flex items-center justify-between bg-card border border-border rounded-lg px-4 py-3 shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {chapter.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Class {chapter.classNumber} · {chapter.subject}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingChapter(chapter);
                          setView("editChapter");
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{chapter.title}"?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteChapter(chapter.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deleteChapterMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "Delete"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* PDF Entries Tab */}
          <TabsContent value="pdfs">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                All PDF Entries
              </h2>
              <Button
                onClick={() => {
                  setEditingPdf(null);
                  setView("addPdf");
                }}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add PDF Entry
              </Button>
            </div>

            {pdfsLoading && (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders are positional
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            )}

            {pdfsError && (
              <div className="flex items-center gap-2 text-destructive py-8 justify-center">
                <AlertCircle className="w-5 h-5" />
                <span>Failed to load PDF entries.</span>
              </div>
            )}

            {!pdfsLoading && !pdfsError && pdfList.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No PDF entries yet. Add your first entry!</p>
              </div>
            )}

            {!pdfsLoading && !pdfsError && pdfList.length > 0 && (
              <div className="space-y-3">
                {pdfList.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between bg-card border border-border rounded-lg px-4 py-3 shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {entry.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                        {entry.entryType}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingPdf(entry);
                          setView("editPdf");
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete PDF Entry
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{entry.title}"?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePdf(entry.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deletePdfMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "Delete"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
