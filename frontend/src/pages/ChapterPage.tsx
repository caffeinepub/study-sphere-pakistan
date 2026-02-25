import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, CheckCircle, Circle, BookOpen, Headphones, HelpCircle, Layers, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetChapter } from '../hooks/useQueries';
import { mapBackendChapter } from '../utils/chapterMapper';
import { isChapterCompleted, toggleChapterCompleted, addRecentlyViewed } from '../utils/storageService';
import type { Chapter } from '../types/chapter';
import AudioPlayer from '../components/AudioPlayer';
import QuizSection from '../components/QuizSection';
import FlashcardSection from '../components/FlashcardSection';

export default function ChapterPage() {
  const { chapterId } = useParams({ strict: false }) as { chapterId: string };
  const navigate = useNavigate();
  const [completed, setCompleted] = useState(false);

  const { data: backendChapter, isLoading, isError } = useGetChapter(
    chapterId ? BigInt(chapterId) : null
  );

  const chapter: Chapter | null = backendChapter ? mapBackendChapter(backendChapter) : null;

  useEffect(() => {
    if (chapterId) {
      setCompleted(isChapterCompleted(chapterId));
      addRecentlyViewed(chapterId);
    }
  }, [chapterId]);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
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
          <TabsList className="w-full mb-6">
            <TabsTrigger value="notes" className="flex-1 flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Notes</span>
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex-1 flex items-center gap-1">
              <Headphones className="w-4 h-4" />
              <span className="hidden sm:inline">Audio</span>
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex-1 flex items-center gap-1">
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Quiz</span>
              {chapter.quizQuestions.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs px-1">
                  {chapter.quizQuestions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="flashcards" className="flex-1 flex items-center gap-1">
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
            {chapter.notesUrl ? (
              <div className="rounded-xl overflow-hidden border border-border">
                <iframe
                  src={chapter.notesUrl}
                  className="w-full h-[70vh]"
                  title="Chapter Notes"
                  allow="autoplay"
                />
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No notes available for this chapter.</p>
              </div>
            )}
          </TabsContent>

          {/* Audio Tab */}
          <TabsContent value="audio">
            {chapter.audioUrl ? (
              <AudioPlayer url={chapter.audioUrl} />
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Headphones className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No audio available for this chapter.</p>
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
                <p>No quiz questions available for this chapter.</p>
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
                <p>No flashcards available for this chapter.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
