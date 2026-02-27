import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Search, BookOpen, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAllChapters } from '../hooks/useQueries';
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

  const { data: chapters, isLoading, isError } = useGetAllChapters();

  useEffect(() => {
    setRecentIds(getRecentlyViewed());
  }, []);

  const subjectChapters = (chapters ?? []).filter(
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
                <button
                  key={ch.id}
                  onClick={() => handleChapterClick(ch)}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg bg-card border border-border hover:border-primary/40 transition-all"
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
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
