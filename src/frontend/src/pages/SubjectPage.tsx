import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import { AlertCircle, BookOpen, Heart, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useGetAllChapters } from "../hooks/useQueries";
import type { Chapter } from "../types/chapter";
import {
  addRecentlyViewed,
  getFavoriteChapters,
  getRecentlyViewed,
  isChapterFavorite,
  toggleChapterFavorite,
} from "../utils/storageService";

const SUBJECT_LABELS: Record<string, string> = {
  english: "English",
  biology: "Biology",
  chemistry: "Chemistry",
  physics: "Physics",
};

export default function SubjectPage() {
  const { classNum, subject } = useParams({ strict: false }) as {
    classNum: string;
    subject: string;
  };
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const { data: chapters, isLoading, isError } = useGetAllChapters();

  useEffect(() => {
    setRecentIds(getRecentlyViewed());
    setFavoriteIds(getFavoriteChapters());
  }, []);

  const subjectChapters = (chapters ?? []).filter(
    (ch) =>
      ch.classNumber === classNum &&
      ch.subject.toLowerCase() === subject.toLowerCase(),
  );

  const filtered = subjectChapters.filter((ch) =>
    ch.title.toLowerCase().includes(search.toLowerCase()),
  );

  const recentChapters = recentIds
    .map((id) => subjectChapters.find((ch) => ch.id === id))
    .filter(Boolean) as Chapter[];

  const favoriteChapters = favoriteIds
    .map((id) => subjectChapters.find((ch) => ch.id === id))
    .filter(Boolean) as Chapter[];

  const handleChapterClick = (chapter: Chapter) => {
    addRecentlyViewed(chapter.id);
    setRecentIds(getRecentlyViewed());
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate({ to: `/chapter/${chapter.id}` });
  };

  const handleToggleFavorite = (e: React.MouseEvent, chapterId: string) => {
    e.stopPropagation();
    toggleChapterFavorite(chapterId);
    setFavoriteIds(getFavoriteChapters());
  };

  const subjectLabel = SUBJECT_LABELS[subject.toLowerCase()] ?? subject;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: `/class/${classNum}` })}
          >
            <BookOpen className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {subjectLabel}
            </h1>
            <p className="text-sm text-muted-foreground">Class {classNum}</p>
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

        {/* Favorites */}
        {favoriteChapters.length > 0 && !search && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              Favorites
            </h2>
            <div className="space-y-2">
              {favoriteChapters.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => handleChapterClick(ch)}
                  className="w-full text-left px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center gap-3"
                >
                  <Heart className="w-4 h-4 text-red-500 fill-red-500 shrink-0" />
                  <span className="text-sm font-medium text-foreground">
                    {ch.title}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

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
                  type="button"
                  onClick={() => handleChapterClick(ch)}
                  className="w-full text-left px-4 py-3 rounded-lg bg-accent/40 hover:bg-accent dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                >
                  <BookOpen className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-medium text-foreground">
                    {ch.title}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Chapter List */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {search ? "Search Results" : "All Chapters"}
          </h2>

          {isLoading && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders are positional
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
              <p>
                {search
                  ? "No chapters match your search."
                  : "No chapters added yet."}
              </p>
            </div>
          )}

          {!isLoading && !isError && (
            <div className="space-y-2">
              {filtered.map((ch) => (
                <div
                  key={ch.id}
                  className="flex items-center gap-2 rounded-lg bg-card border border-border hover:border-primary/40 transition-all"
                >
                  <button
                    type="button"
                    onClick={() => handleChapterClick(ch)}
                    className="flex-1 text-left flex items-center gap-3 px-4 py-3 min-w-0"
                  >
                    <BookOpen className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-medium text-foreground truncate">
                      {ch.title}
                    </span>
                    <div className="ml-auto flex gap-1 shrink-0">
                      {(ch.notesUrl || ch.notesUrl1) && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-0"
                        >
                          Notes
                        </Badge>
                      )}
                      {ch.audioUrl1 && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-0"
                        >
                          Audio
                        </Badge>
                      )}
                      {ch.quizQuestions.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-0"
                        >
                          Quiz
                        </Badge>
                      )}
                      {ch.flashcards.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-0"
                        >
                          Cards
                        </Badge>
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleToggleFavorite(e, ch.id)}
                    className="px-3 py-3 shrink-0 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-r-lg transition-colors"
                    title={
                      isChapterFavorite(ch.id)
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        favoriteIds.includes(ch.id)
                          ? "text-red-500 fill-red-500"
                          : "text-muted-foreground hover:text-red-400"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
