import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Plus, Pencil, Trash2, BookOpen, FileText, Loader2, AlertCircle, ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
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
} from '@/components/ui/alert-dialog';
import {
  useGetAllChapters,
  useDeleteChapter,
  useGetAllPdfEntries,
  useDeletePdfEntry,
} from '../hooks/useQueries';
import { mapBackendChapter, mapBackendPdfEntry } from '../utils/chapterMapper';
import type { Chapter, PdfEntry } from '../types/chapter';
import ChapterForm from '../components/ChapterForm';
import PdfEntryForm from '../components/PdfEntryForm';
import AdminAuthGuard from '../components/AdminAuthGuard';

function AdminPanelContent() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chapters');
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [showPdfForm, setShowPdfForm] = useState(false);
  const [editingPdf, setEditingPdf] = useState<PdfEntry | null>(null);

  const { data: backendChapters, isLoading: chaptersLoading, isError: chaptersError } = useGetAllChapters();
  const { data: backendPdfs, isLoading: pdfsLoading, isError: pdfsError } = useGetAllPdfEntries();
  const deleteChapterMutation = useDeleteChapter();
  const deletePdfMutation = useDeletePdfEntry();

  const chapters: Chapter[] = (backendChapters ?? []).map(mapBackendChapter);
  const pdfEntries: PdfEntry[] = (backendPdfs ?? []).map(mapBackendPdfEntry);

  const handleDeleteChapter = async (id: string) => {
    await deleteChapterMutation.mutateAsync(BigInt(id));
  };

  const handleDeletePdf = async (id: string) => {
    await deletePdfMutation.mutateAsync(BigInt(id));
  };

  const handleChapterSaved = () => {
    setShowChapterForm(false);
    setEditingChapter(null);
  };

  const handlePdfSaved = () => {
    setShowPdfForm(false);
    setEditingPdf(null);
  };

  if (showChapterForm || editingChapter) {
    return (
      <ChapterForm
        chapter={editingChapter ?? undefined}
        onSave={handleChapterSaved}
        onCancel={() => { setShowChapterForm(false); setEditingChapter(null); }}
      />
    );
  }

  if (showPdfForm || editingPdf) {
    return (
      <PdfEntryForm
        entry={editingPdf ?? undefined}
        onSave={handlePdfSaved}
        onCancel={() => { setShowPdfForm(false); setEditingPdf(null); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/' })}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Manage chapters and PDF entries</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="chapters" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Chapters
              {chapters.length > 0 && (
                <Badge variant="secondary" className="ml-1">{chapters.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pdfs" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              PDF Entries
              {pdfEntries.length > 0 && (
                <Badge variant="secondary" className="ml-1">{pdfEntries.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Chapters Tab */}
          <TabsContent value="chapters">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-foreground">All Chapters</h2>
              <Button onClick={() => setShowChapterForm(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Chapter
              </Button>
            </div>

            {chaptersLoading && (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
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

            {!chaptersLoading && !chaptersError && chapters.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No chapters yet. Add your first chapter!</p>
              </div>
            )}

            {!chaptersLoading && !chaptersError && (
              <div className="space-y-2">
                {chapters.map((ch) => (
                  <div
                    key={ch.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-card border border-border"
                  >
                    <BookOpen className="w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{ch.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Class {ch.classNumber} · {ch.subject}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {ch.notesUrl && <Badge variant="outline" className="text-xs">Notes</Badge>}
                      {ch.audioUrl && <Badge variant="outline" className="text-xs">Audio</Badge>}
                      {ch.quizQuestions.length > 0 && (
                        <Badge variant="outline" className="text-xs">{ch.quizQuestions.length}Q</Badge>
                      )}
                      {ch.flashcards.length > 0 && (
                        <Badge variant="outline" className="text-xs">{ch.flashcards.length}F</Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingChapter(ch)}
                      className="shrink-0"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{ch.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteChapter(ch.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deleteChapterMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Delete'
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* PDF Entries Tab */}
          <TabsContent value="pdfs">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-foreground">PDF Entries</h2>
              <Button onClick={() => setShowPdfForm(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add PDF Entry
              </Button>
            </div>

            {pdfsLoading && (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
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

            {!pdfsLoading && !pdfsError && pdfEntries.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No PDF entries yet. Add your first entry!</p>
              </div>
            )}

            {!pdfsLoading && !pdfsError && (
              <div className="space-y-2">
                {pdfEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-card border border-border"
                  >
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{entry.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {entry.entryType === 'past-paper' ? 'Past Paper' : 'Practice Test'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingPdf(entry)}
                      className="shrink-0"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete PDF Entry</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{entry.title}"?
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
                              'Delete'
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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

export default function AdminPage() {
  return (
    <AdminAuthGuard>
      <AdminPanelContent />
    </AdminAuthGuard>
  );
}
