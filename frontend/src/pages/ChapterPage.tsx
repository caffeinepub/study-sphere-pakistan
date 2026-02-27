import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, CheckCircle, Circle, BookOpen, Headphones, HelpCircle, Layers, AlertCircle, FileText, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetChapter } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { isChapterCompleted, toggleChapterCompleted, addRecentlyViewed } from '../utils/storageService';
import AudioPlayer from '../components/AudioPlayer';
import QuizSection from '../components/QuizSection';
import FlashcardSection from '../components/FlashcardSection';
import NotesViewer from '../components/NotesViewer';

export default function ChapterPage() {
  const { chapterId } = useParams({ strict: false }) as { chapterId: string };
  const navigate = useNavigate();
  const { actor } = useActor();
  const [completed, setCompleted] = useState(false);

  // Notes selection
  const [selectedNotesUrl, setSelectedNotesUrl] = useState<string | null>(null);

  // Audio selection & loading
  const [selectedAudioSlot, setSelectedAudioSlot] = useState<1 | 2 | null>(null);
  const [audioObjectUrl, setAudioObjectUrl] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const { data: chapter, isLoading, isError } = useGetChapter(chapterId ?? null);

  useEffect(() => {
    if (chapterId) {
      setCompleted(isChapterCompleted(chapterId));
      addRecentlyViewed(chapterId);
    }
  }, [chapterId]);

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  // Auto-select first available notes when chapter loads
  useEffect(() => {
    if (!chapter) return;
    const firstUrl = chapter.notesUrl1 || chapter.notesUrl || "";
    if (firstUrl) setSelectedNotesUrl(firstUrl);
  }, [chapter?.id]);

  const handleToggleCompleted = () => {
    if (!chapterId) return;
    const nowCompleted = toggleChapterCompleted(chapterId);
    setCompleted(nowCompleted);
  };

  const handleBack = () => {
    if (chapter) {
      if (chapter.classNumber === 'MDCAT') {
        navigate({ to: `/mdcat/${chapter.subject.toLowerCase()}` });
      } else {
        navigate({ to: `/class/${chapter.classNumber}/${chapter.subject.toLowerCase()}` });
      }
    } else {
      navigate({ to: '/' });
    }
  };

  const handleSelectAudio = async (slot: 1 | 2) => {
    if (!actor || !chapterId) return;
    setSelectedAudioSlot(slot);
    setAudioLoading(true);
    setAudioError(null);

    // Revoke previous object URL
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
      setAudioObjectUrl(null);
    }

    try {
      const data = slot === 1
        ? await actor.getAudioData(BigInt(chapterId))
        : await actor.getAudioData2(BigInt(chapterId));

      if (data && data.length > 0) {
        const mimeType = slot === 1
          ? (chapter?.audioMimeType || "audio/mpeg")
          : (chapter?.audioMimeType2 || "audio/mpeg");

        // Copy bytes into a guaranteed plain ArrayBuffer to satisfy Blob constructor types
        const plainBuffer = new ArrayBuffer(data.byteLength);
        new Uint8Array(plainBuffer).set(data);
        const blob = new Blob([plainBuffer], { type: mimeType });
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;
        setAudioObjectUrl(url);
      } else {
        // Fall back to legacy audioUrl for slot 1
        if (slot === 1 && chapter?.audioUrl) {
          setAudioObjectUrl(chapter.audioUrl);
        } else {
          setAudioError("Audio data not found.");
        }
      }
    } catch {
      setAudioError("Failed to load audio. Please try again.");
    } finally {
      setAudioLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <Skeleton className="h-8 w-48" />
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  if (isError || !chapter) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <p className="text-foreground font-medium">Chapter not found.</p>
          <Button onClick={() => navigate({ to: '/' })}>Go Home</Button>
        </div>
      </div>
    );
  }

  // Build notes options
  const notesOptions: { url: string; label: string }[] = [];
  const url1 = chapter.notesUrl1 || chapter.notesUrl;
  if (url1) notesOptions.push({ url: url1, label: chapter.notesLabel1 || "Notes 1" });
  if (chapter.notesUrl2) notesOptions.push({ url: chapter.notesUrl2, label: chapter.notesLabel2 || "Notes 2" });

  // Build audio options
  const audioOptions: { slot: 1 | 2; label: string }[] = [];
  if (chapter.hasAudioBlob || chapter.audioUrl) {
    audioOptions.push({ slot: 1, label: chapter.audioLabel1 || "Audio 1" });
  }
  if (chapter.hasAudioBlob2) {
    audioOptions.push({ slot: 2, label: chapter.audioLabel2 || "Audio 2" });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-foreground truncate">{chapter.title}</h1>
            <p className="text-sm text-muted-foreground">
              {chapter.classNumber === 'MDCAT' ? 'MDCAT' : `Class ${chapter.classNumber}`} · {chapter.subject}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleCompleted}
            title={completed ? 'Mark as incomplete' : 'Mark as completed'}
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
        <Tabs defaultValue="notes">
          <TabsList className="w-full mb-6 bg-muted">
            <TabsTrigger
              value="notes"
              className="flex-1 flex items-center gap-1 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Notes</span>
            </TabsTrigger>
            <TabsTrigger
              value="audio"
              className="flex-1 flex items-center gap-1 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground"
            >
              <Headphones className="w-4 h-4" />
              <span className="hidden sm:inline">Audio</span>
            </TabsTrigger>
            <TabsTrigger
              value="quiz"
              className="flex-1 flex items-center gap-1 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Quiz</span>
              {chapter.quizQuestions.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs px-1">
                  {chapter.quizQuestions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="flashcards"
              className="flex-1 flex items-center gap-1 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
              {chapter.flashcards.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs px-1">
                  {chapter.flashcards.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Notes Tab */}
          <TabsContent value="notes">
            {notesOptions.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-foreground/60">No notes available for this chapter.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Named buttons to select notes */}
                {notesOptions.length > 1 && (
                  <div className="flex flex-wrap gap-2">
                    {notesOptions.map((opt) => (
                      <button
                        key={opt.url}
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
                {/* Single option: show label as heading */}
                {notesOptions.length === 1 && (
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <FileText className="w-4 h-4 text-primary" />
                    <span>{notesOptions[0].label}</span>
                  </div>
                )}
                {selectedNotesUrl && (
                  <NotesViewer url={selectedNotesUrl} />
                )}
              </div>
            )}
          </TabsContent>

          {/* Audio Tab */}
          <TabsContent value="audio">
            {audioOptions.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Headphones className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-foreground/60">No audio available for this chapter.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Named buttons to select audio */}
                <div className="flex flex-wrap gap-2">
                  {audioOptions.map((opt) => (
                    <button
                      key={opt.slot}
                      onClick={() => handleSelectAudio(opt.slot)}
                      disabled={audioLoading}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all disabled:opacity-60 ${
                        selectedAudioSlot === opt.slot
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-muted"
                      }`}
                    >
                      <Music className="w-4 h-4" />
                      {opt.label}
                    </button>
                  ))}
                </div>

                {audioLoading && (
                  <div className="flex items-center justify-center py-8 gap-3 text-muted-foreground">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-foreground/70">Loading audio...</span>
                  </div>
                )}

                {audioError && !audioLoading && (
                  <div className="flex items-center gap-2 text-destructive py-4">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span className="text-sm">{audioError}</span>
                  </div>
                )}

                {audioObjectUrl && !audioLoading && !audioError && (
                  <AudioPlayer url={audioObjectUrl} />
                )}

                {!selectedAudioSlot && !audioLoading && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Select an audio file above to start listening.
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz">
            {chapter.quizQuestions.length > 0 ? (
              <QuizSection questions={chapter.quizQuestions} />
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-foreground/60">No quiz questions available for this chapter.</p>
              </div>
            )}
          </TabsContent>

          {/* Flashcards Tab */}
          <TabsContent value="flashcards">
            {chapter.flashcards.length > 0 ? (
              <FlashcardSection cards={chapter.flashcards} />
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-foreground/60">No flashcards available for this chapter.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
