import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, BookOpen, Heart, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useGetAllChapters, useGetTopicsByChapter } from "../hooks/useQueries";
import type { Topic } from "../types/chapter";
import {
  addRecentlyViewed,
  getFavoriteTopics,
  getRecentlyViewedTopics,
  isTopicFavorite,
  toggleTopicFavorite,
} from "../utils/storageService";

export default function ChapterPage() {
  const { chapterId } = useParams({ strict: false }) as { chapterId: string };
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [recentTopicIds, setRecentTopicIds] = useState<string[]>([]);
  const [favoriteTopicIds, setFavoriteTopicIds] = useState<string[]>([]);

  const { data: chapters } = useGetAllChapters();
  const {
    data: topics,
    isLoading,
    isError,
  } = useGetTopicsByChapter(chapterId ?? null);

  const chapter = chapters?.find((c) => c.id === chapterId);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (chapterId) addRecentlyViewed(chapterId);
    setRecentTopicIds(getRecentlyViewedTopics());
    setFavoriteTopicIds(getFavoriteTopics());
  }, [chapterId]);

  const topicList = topics ?? [];

  const filtered = topicList.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()),
  );

  const recentTopics = recentTopicIds
    .map((id) => topicList.find((t) => t.id === id))
    .filter(Boolean) as Topic[];

  const favoriteTopics = favoriteTopicIds
    .map((id) => topicList.find((t) => t.id === id))
    .filter(Boolean) as Topic[];

  const handleTopicClick = (topic: Topic) => {
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate({ to: `/topic/${topic.id}` });
  };

  const handleToggleFavorite = (e: React.MouseEvent, topicId: string) => {
    e.stopPropagation();
    toggleTopicFavorite(topicId);
    setFavoriteTopicIds(getFavoriteTopics());
  };

  const handleBack = () => {
    if (chapter) {
      if (chapter.classNumber === "MDCAT") {
        navigate({ to: `/mdcat/${chapter.subject.toLowerCase()}` });
      } else {
        navigate({
          to: `/class/${chapter.classNumber}/${chapter.subject.toLowerCase()}`,
        });
      }
    } else {
      navigate({ to: "/" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            data-ocid="chapter.back.button"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">
              {chapter?.title ?? "Chapter"}
            </h1>
            {chapter && (
              <p className="text-sm text-muted-foreground">
                {chapter.classNumber === "MDCAT"
                  ? "MDCAT"
                  : `Class ${chapter.classNumber}`}{" "}
                · {chapter.subject}
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-ocid="chapter.search_input"
          />
        </div>

        {/* Favorites */}
        {favoriteTopics.length > 0 && !search && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              Favorites
            </h2>
            <div className="space-y-2">
              {favoriteTopics.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTopicClick(t)}
                  className="w-full text-left px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center gap-3"
                >
                  <Heart className="w-4 h-4 text-red-500 fill-red-500 shrink-0" />
                  <span className="text-sm font-medium text-foreground">
                    {t.title}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Recently Viewed */}
        {recentTopics.length > 0 && !search && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Recently Viewed
            </h2>
            <div className="space-y-2">
              {recentTopics.slice(0, 3).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTopicClick(t)}
                  className="w-full text-left px-4 py-3 rounded-lg bg-accent/40 hover:bg-accent dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                >
                  <BookOpen className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-medium text-foreground">
                    {t.title}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Topic List */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {search ? "Search Results" : "Topics"}
          </h2>

          {isLoading && (
            <div className="space-y-3" data-ocid="chapter.loading_state">
              {[...Array(4)].map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          )}

          {isError && (
            <div
              className="flex items-center gap-2 text-destructive py-8 justify-center"
              data-ocid="chapter.error_state"
            >
              <AlertCircle className="w-5 h-5" />
              <span>Failed to load topics. Please try again.</span>
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="chapter.empty_state"
            >
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>
                {search
                  ? "No topics match your search."
                  : "No topics added yet."}
              </p>
            </div>
          )}

          {!isLoading && !isError && (
            <div className="space-y-2">
              {filtered.map((t, i) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2 rounded-lg bg-card border border-border hover:border-primary/40 transition-all"
                  data-ocid={`chapter.topic.item.${i + 1}`}
                >
                  <button
                    type="button"
                    onClick={() => handleTopicClick(t)}
                    className="flex-1 text-left flex items-center gap-3 px-4 py-3 min-w-0"
                  >
                    <BookOpen className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-medium text-foreground truncate">
                      {t.title}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleToggleFavorite(e, t.id)}
                    className="px-3 py-3 shrink-0 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-r-lg transition-colors"
                    title={
                      isTopicFavorite(t.id)
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        favoriteTopicIds.includes(t.id)
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
