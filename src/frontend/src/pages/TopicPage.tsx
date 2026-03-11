import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Circle,
  FileText,
  Headphones,
  Heart,
  HelpCircle,
  Layers,
  Music,
  ToggleLeft,
} from "lucide-react";
import { useEffect, useState } from "react";
import AudioPlayer from "../components/AudioPlayer";
import FlashcardSection from "../components/FlashcardSection";
import NotesViewer from "../components/NotesViewer";
import QuizSection from "../components/QuizSection";
import TrueFalseSection from "../components/TrueFalseSection";
import { useGetTopic } from "../hooks/useQueries";
import {
  addRecentlyViewedTopic,
  isTopicCompleted,
  isTopicFavorite,
  toggleTopicCompleted,
  toggleTopicFavorite,
} from "../utils/storageService";

export default function TopicPage() {
  const { topicId } = useParams({ strict: false }) as { topicId: string };
  const navigate = useNavigate();
  const [completed, setCompleted] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [selectedNotesUrl, setSelectedNotesUrl] = useState<string | null>(null);
  const [selectedAudioUrl, setSelectedAudioUrl] = useState<string | null>(null);
  const [selectedAudioSlot, setSelectedAudioSlot] = useState<1 | 2 | null>(
    null,
  );

  const { data: topic, isLoading, isError } = useGetTopic(topicId ?? null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (topicId) {
      setCompleted(isTopicCompleted(topicId));
      setFavorite(isTopicFavorite(topicId));
      addRecentlyViewedTopic(topicId);
    }
  }, [topicId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: run only when topic id changes
  useEffect(() => {
    if (!topic) return;
    if (topic.notesUrl1) setSelectedNotesUrl(topic.notesUrl1);
    if (topic.audioUrl1) {
      setSelectedAudioSlot(1);
      setSelectedAudioUrl(topic.audioUrl1);
    } else if (topic.audioUrl2) {
      setSelectedAudioSlot(2);
      setSelectedAudioUrl(topic.audioUrl2);
    }
  }, [topic?.id]);

  const handleToggleCompleted = () => {
    if (!topicId) return;
    setCompleted(toggleTopicCompleted(topicId));
  };

  const handleToggleFavorite = () => {
    if (!topicId) return;
    setFavorite(toggleTopicFavorite(topicId));
  };

  const handleSelectAudio = (slot: 1 | 2) => {
    if (!topic) return;
    const url = slot === 1 ? topic.audioUrl1 : topic.audioUrl2;
    setSelectedAudioSlot(slot);
    setSelectedAudioUrl(url || null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <Skeleton className="h-8 w-48" />
          </div>
        </header>
        <main
          className="max-w-3xl mx-auto px-4 py-6 space-y-4"
          data-ocid="topic.loading_state"
        >
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  if (isError || !topic) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        data-ocid="topic.error_state"
      >
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <p className="text-foreground font-medium">Topic not found.</p>
          <Button onClick={() => navigate({ to: "/" })}>Go Home</Button>
        </div>
      </div>
    );
  }

  const notesOptions: { url: string; label: string }[] = [];
  if (topic.notesUrl1)
    notesOptions.push({
      url: topic.notesUrl1,
      label: topic.notesLabel1 || "Notes 1",
    });
  if (topic.notesUrl2)
    notesOptions.push({
      url: topic.notesUrl2,
      label: topic.notesLabel2 || "Notes 2",
    });

  const audioOptions: { slot: 1 | 2; label: string; url: string }[] = [];
  if (topic.audioUrl1)
    audioOptions.push({
      slot: 1,
      label: topic.audioLabel1 || "Audio 1",
      url: topic.audioUrl1,
    });
  if (topic.audioUrl2)
    audioOptions.push({
      slot: 2,
      label: topic.audioLabel2 || "Audio 2",
      url: topic.audioUrl2,
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: `/chapter/${topic.chapterId}` })}
            data-ocid="topic.back.button"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-foreground truncate">
              {topic.title}
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavorite}
            title={favorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={`w-5 h-5 transition-colors ${favorite ? "text-red-500 fill-red-500" : "text-muted-foreground"}`}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleCompleted}
            title={completed ? "Mark as incomplete" : "Mark as completed"}
          >
            {completed ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground" />
            )}
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <Tabs
          defaultValue="notes"
          onValueChange={() => window.scrollTo({ top: 0, behavior: "instant" })}
        >
          <TabsList className="w-full mb-6 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <TabsTrigger
              value="notes"
              className="flex-1 flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 dark:text-gray-100 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:hover:text-white transition-colors"
              data-ocid="topic.notes.tab"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Notes</span>
            </TabsTrigger>
            <TabsTrigger
              value="audio"
              className="flex-1 flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 dark:text-gray-100 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:hover:text-white transition-colors"
              data-ocid="topic.audio.tab"
            >
              <Headphones className="w-4 h-4" />
              <span className="hidden sm:inline">Audio</span>
            </TabsTrigger>
            <TabsTrigger
              value="quiz"
              className="flex-1 flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 dark:text-gray-100 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:hover:text-white transition-colors"
              data-ocid="topic.quiz.tab"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Quiz</span>
              {topic.quizQuestions.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 text-xs px-1 bg-primary/10 dark:bg-white/30 text-primary dark:text-white"
                >
                  {topic.quizQuestions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="truefalse"
              className="flex-1 flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 dark:text-gray-100 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:hover:text-white transition-colors"
              data-ocid="topic.truefalse.tab"
            >
              <ToggleLeft className="w-4 h-4" />
              <span className="hidden sm:inline">T/F</span>
              {topic.trueFalseQuestions.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 text-xs px-1 bg-primary/10 dark:bg-white/30 text-primary dark:text-white"
                >
                  {topic.trueFalseQuestions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="flashcards"
              className="flex-1 flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 dark:text-gray-100 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:hover:text-white transition-colors"
              data-ocid="topic.flashcards.tab"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
              {topic.flashcards.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 text-xs px-1 bg-primary/10 dark:bg-white/30 text-primary dark:text-white"
                >
                  {topic.flashcards.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Notes Tab */}
          <TabsContent value="notes">
            {notesOptions.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-foreground/60">
                  No notes available for this topic.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {notesOptions.length > 1 && (
                  <div className="flex flex-wrap gap-2">
                    {notesOptions.map((opt) => (
                      <button
                        key={opt.url}
                        type="button"
                        onClick={() => setSelectedNotesUrl(opt.url)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          selectedNotesUrl === opt.url
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-muted"
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
                {notesOptions.length === 1 && (
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <FileText className="w-4 h-4 text-primary" />
                    <span>{notesOptions[0].label}</span>
                  </div>
                )}
                {selectedNotesUrl && <NotesViewer url={selectedNotesUrl} />}
              </div>
            )}
          </TabsContent>

          {/* Audio Tab */}
          <TabsContent value="audio">
            {audioOptions.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Headphones className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-foreground/60">
                  No audio available for this topic.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {audioOptions.length > 1 && (
                  <div className="flex flex-wrap gap-2">
                    {audioOptions.map((opt) => (
                      <button
                        key={opt.slot}
                        type="button"
                        onClick={() => handleSelectAudio(opt.slot)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          selectedAudioSlot === opt.slot
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-muted"
                        }`}
                        data-ocid="topic.audio.button"
                      >
                        <Music className="w-4 h-4" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
                {audioOptions.length === 1 && (
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Headphones className="w-4 h-4 text-primary" />
                    <span>{audioOptions[0].label}</span>
                  </div>
                )}
                {selectedAudioUrl && (
                  <AudioPlayer
                    url={selectedAudioUrl}
                    label={
                      audioOptions.find((o) => o.url === selectedAudioUrl)
                        ?.label
                    }
                  />
                )}
              </div>
            )}
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz">
            {topic.quizQuestions.length > 0 ? (
              <QuizSection questions={topic.quizQuestions} />
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-foreground/60">
                  No quiz questions available for this topic.
                </p>
              </div>
            )}
          </TabsContent>

          {/* True/False Tab */}
          <TabsContent value="truefalse">
            {topic.trueFalseQuestions.length > 0 ? (
              <TrueFalseSection questions={topic.trueFalseQuestions} />
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <ToggleLeft className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-foreground/60">
                  No true/false questions available for this topic.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Flashcards Tab */}
          <TabsContent value="flashcards">
            {topic.flashcards.length > 0 ? (
              <FlashcardSection cards={topic.flashcards} />
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-foreground/60">
                  No flashcards available for this topic.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
