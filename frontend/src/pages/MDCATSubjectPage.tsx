import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Search, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAllChapters, useDeleteChapter } from '../hooks/useQueries';
import { mapBackendChapter } from '../utils/chapterMapper';
import { getRecentlyViewed, addRecentlyViewed } from '../utils/storageService';
import type { Chapter } from '../types/chapter';

const MDCAT_SUBJECT_LABELS: Record<string, string> = {
  biology: 'Biology',
  chemistry: 'Chemistry',
  physics: 'Physics',
  english: 'English',
  'logical-reasoning': 'Logical Reasoning',
};

export default function MDCATSubjectPage() {
  const { subject } = useParams({ strict: false }) as { subject: string };
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [recentIds, setRecentIds] = useState<string[]>([]);

  const { data: backendChapters, isLoading, isError } = useGetAllChapters();
  const deleteChapterMutation = useDeleteChapter();

  useEffect(() => {
    setRecentIds(getRecentlyViewed());
  }, []);

  const allChapters: Chapter[] = (backendChapters ?? []).map(mapBackendChapter);

  const subjectChapters = allChapters.filter(
    (ch) =>
      ch.classNumber === 'MDCAT' &&
      ch.subject.toLowerCase() === subject.toLowerCase()
  );

  const filtered = subjectChapters.filter((ch) =>
    ch.title.toLowerCase().includes(search.toLowerCase())
  );

  const recentChapters = recentIds
    .map((id) => subjectChapters.find((ch) => ch.id === id))
    .filter(Boolean) as Chapter[];

  const handleChapterClick = (chapter: Chapter) => {
    addRecentlyViewed(chapter.id);
    setRecentIds(getRecentlyViewed());
    navigate({ to: `/chapter/${chapter.id}` });
  };

  const handleDelete = async (id: string) => {
    await deleteChapterMutation.mutateAsync(BigInt(id));
  };

  const subjectLabel = MDCAT_SUBJECT_LABELS[subject.toLowerCase()] ?? subject;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/mdcat' })}>
            <BookOpen className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">{subjectLabel}</h1>
            <p className="text-sm text-muted-foreground">MDCAT Prep</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search chapters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Recently Viewed */}
        {recentChapters.length > 0 && !search && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Recently Viewed
            </h2>
            <div className="space-y-2">
              {recentChapters.slice(0, 3).map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => handleChapterClick(ch)}
                  className="w-full text-left px-4 py-3 rounded-lg bg-accent/40 hover:bg-accent transition-colors flex items-center gap-3"
                >
                  <BookOpen className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-medium text-foreground">{ch.title}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Chapter List */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {search ? 'Search Results' : 'All Chapters'}
          </h2>

          {isLoading && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          )}

          {isError && (
            <div className="flex items-center gap-2 text-destructive py-8 justify-center">
              <AlertCircle className="w-5 h-5" />
              <span>Failed to load chapters. Please try again.</span>
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>{search ? 'No chapters match your search.' : 'No chapters added yet.'}</p>
            </div>
          )}

          {!isLoading && !isError && (
            <div className="space-y-2">
              {filtered.map((ch) => (
                <div
                  key={ch.id}
                  className="group flex items-center gap-2 px-4 py-3 rounded-lg bg-card border border-border hover:border-primary/40 transition-all"
                >
                  <button
                    className="flex-1 text-left flex items-center gap-3"
                    onClick={() => handleChapterClick(ch)}
                  >
                    <BookOpen className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-medium text-foreground">{ch.title}</span>
                    <div className="ml-auto flex gap-1">
                      {ch.notesUrl && <Badge variant="secondary" className="text-xs">Notes</Badge>}
                      {ch.audioUrl && <Badge variant="secondary" className="text-xs">Audio</Badge>}
                      {ch.quizQuestions.length > 0 && <Badge variant="secondary" className="text-xs">Quiz</Badge>}
                      {ch.flashcards.length > 0 && <Badge variant="secondary" className="text-xs">Cards</Badge>}
                    </div>
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <span className="sr-only">Delete</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
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
                          onClick={() => handleDelete(ch.id)}
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
        </section>
      </main>
    </div>
  );
}
