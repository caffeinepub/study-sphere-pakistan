import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddChapter, useUpdateChapter } from '../hooks/useQueries';
import type { Chapter, QuizQuestion, FlashcardItem } from '../types/chapter';

interface ChapterFormProps {
  chapter?: Chapter;
  onSave: () => void;
  onCancel: () => void;
}

const CLASS_OPTIONS = ['9', '10', '11', '12', 'MDCAT'];
const SUBJECT_OPTIONS = ['English', 'Biology', 'Chemistry', 'Physics', 'Logical Reasoning'];

export default function ChapterForm({ chapter, onSave, onCancel }: ChapterFormProps) {
  const [title, setTitle] = useState(chapter?.title ?? '');
  const [classNumber, setClassNumber] = useState(chapter?.classNumber ?? '9');
  const [subject, setSubject] = useState(chapter?.subject ?? 'Biology');
  const [notesUrl, setNotesUrl] = useState(chapter?.notesUrl ?? '');
  const [audioUrl, setAudioUrl] = useState(chapter?.audioUrl ?? '');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(
    chapter?.quizQuestions ?? []
  );
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>(
    chapter?.flashcards ?? []
  );

  const addChapterMutation = useAddChapter();
  const updateChapterMutation = useUpdateChapter();

  const isEditing = !!chapter;
  const isPending = addChapterMutation.isPending || updateChapterMutation.isPending;

  // ─── Quiz helpers ─────────────────────────────────────────────────────────

  const addQuestion = () => {
    setQuizQuestions((prev) => [
      ...prev,
      { question: '', options: ['', '', '', ''], correctAnswer: 0 },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuizQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: string | number) => {
    setQuizQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    setQuizQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? { ...q, options: q.options.map((opt, j) => (j === oIndex ? value : opt)) }
          : q
      )
    );
  };

  // ─── Flashcard helpers ────────────────────────────────────────────────────

  const addFlashcard = () => {
    setFlashcards((prev) => [...prev, { front: '', back: '' }]);
  };

  const removeFlashcard = (index: number) => {
    setFlashcards((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFlashcard = (index: number, field: 'front' | 'back', value: string) => {
    setFlashcards((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [field]: value } : f))
    );
  };

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const input = {
      title: title.trim(),
      classNumber,
      subject,
      notesUrl: notesUrl.trim(),
      audioUrl: audioUrl.trim(),
      quizQuestions: JSON.stringify(quizQuestions),
      flashcards: JSON.stringify(flashcards),
    };

    try {
      if (isEditing && chapter) {
        await updateChapterMutation.mutateAsync({ id: BigInt(chapter.id), input });
      } else {
        await addChapterMutation.mutateAsync(input);
      }
      onSave();
    } catch (err) {
      console.error('Failed to save chapter:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">
            {isEditing ? 'Edit Chapter' : 'Add Chapter'}
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Basic Information
            </h2>

            <div className="space-y-2">
              <Label htmlFor="title">Chapter Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cell Biology"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={classNumber} onValueChange={setClassNumber}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASS_OPTIONS.map((c) => (
                      <SelectItem key={c} value={c}>{c === 'MDCAT' ? 'MDCAT' : `Class ${c}`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECT_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Content URLs */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Content URLs
            </h2>

            <div className="space-y-2">
              <Label htmlFor="notesUrl">Notes URL</Label>
              <Input
                id="notesUrl"
                value={notesUrl}
                onChange={(e) => setNotesUrl(e.target.value)}
                placeholder="https://..."
                type="url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="audioUrl">Audio URL</Label>
              <Input
                id="audioUrl"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </section>

          {/* Quiz Questions */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Quiz Questions ({quizQuestions.length})
              </h2>
              <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                <Plus className="w-4 h-4 mr-1" />
                Add Question
              </Button>
            </div>

            {quizQuestions.map((q, qIdx) => (
              <div key={qIdx} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <Label>Question {qIdx + 1}</Label>
                    <Input
                      value={q.question}
                      onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)}
                      placeholder="Enter question..."
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQuestion(qIdx)}
                    className="text-destructive hover:text-destructive mt-6"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Options (select correct answer)</Label>
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qIdx}`}
                        checked={q.correctAnswer === oIdx}
                        onChange={() => updateQuestion(qIdx, 'correctAnswer', oIdx)}
                        className="accent-primary"
                      />
                      <Input
                        value={opt}
                        onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                        placeholder={`Option ${oIdx + 1}`}
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* Flashcards */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Flashcards ({flashcards.length})
              </h2>
              <Button type="button" variant="outline" size="sm" onClick={addFlashcard}>
                <Plus className="w-4 h-4 mr-1" />
                Add Card
              </Button>
            </div>

            {flashcards.map((card, idx) => (
              <div key={idx} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-3">
                    <div className="space-y-2">
                      <Label>Front</Label>
                      <Input
                        value={card.front}
                        onChange={(e) => updateFlashcard(idx, 'front', e.target.value)}
                        placeholder="Question or term..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Back</Label>
                      <Input
                        value={card.back}
                        onChange={(e) => updateFlashcard(idx, 'back', e.target.value)}
                        placeholder="Answer or definition..."
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFlashcard(idx)}
                    className="text-destructive hover:text-destructive mt-6"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </section>

          {/* Submit */}
          <div className="flex gap-3 pt-2 pb-8">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || isPending} className="flex-1">
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                isEditing ? 'Update Chapter' : 'Save Chapter'
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
