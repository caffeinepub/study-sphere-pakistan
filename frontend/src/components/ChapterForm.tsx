import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddChapter, useUpdateChapter } from "../hooks/useQueries";
import { useActor } from "../hooks/useActor";
import type { Chapter, QuizQuestion, FlashcardItem } from "../types/chapter";
import type { ChapterInput } from "../backend";
import { Plus, Trash2, Loader2, Link } from "lucide-react";
import { callWithRetry } from "../utils/callWithRetry";

interface ChapterFormProps {
  chapter?: Chapter;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ChapterForm({ chapter, onSuccess, onCancel }: ChapterFormProps) {
  const addChapter = useAddChapter();
  const updateChapter = useUpdateChapter();
  const { actor } = useActor();

  const [title, setTitle] = useState(chapter?.title ?? "");
  const [classNumber, setClassNumber] = useState(chapter?.classNumber ?? "");
  const [subject, setSubject] = useState(chapter?.subject ?? "");

  // Notes fields
  const [notesUrl1, setNotesUrl1] = useState(chapter?.notesUrl1 ?? chapter?.notesUrl ?? "");
  const [notesLabel1, setNotesLabel1] = useState(chapter?.notesLabel1 ?? "");
  const [notesUrl2, setNotesUrl2] = useState(chapter?.notesUrl2 ?? "");
  const [notesLabel2, setNotesLabel2] = useState(chapter?.notesLabel2 ?? "");

  // Audio URL fields
  const [audioLabel1, setAudioLabel1] = useState(chapter?.audioLabel1 ?? "");
  const [audioUrl1, setAudioUrl1] = useState(chapter?.audioUrl1 ?? "");
  const [audioLabel2, setAudioLabel2] = useState(chapter?.audioLabel2 ?? "");
  const [audioUrl2, setAudioUrl2] = useState(chapter?.audioUrl2 ?? "");

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(
    chapter?.quizQuestions ?? []
  );
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>(
    chapter?.flashcards ?? []
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const isEditing = !!chapter;

  // Quiz helpers
  const addQuestion = () =>
    setQuizQuestions([
      ...quizQuestions,
      { question: "", options: ["", "", "", ""], correctAnswer: 0 },
    ]);

  const removeQuestion = (i: number) =>
    setQuizQuestions(quizQuestions.filter((_, idx) => idx !== i));

  const updateQuestion = (
    i: number,
    field: keyof QuizQuestion,
    value: string | number
  ) =>
    setQuizQuestions(
      quizQuestions.map((q, idx) => (idx === i ? { ...q, [field]: value } : q))
    );

  const updateOption = (qi: number, oi: number, value: string) =>
    setQuizQuestions(
      quizQuestions.map((q, idx) =>
        idx === qi
          ? { ...q, options: q.options.map((o, oidx) => (oidx === oi ? value : o)) }
          : q
      )
    );

  // Flashcard helpers
  const addFlashcard = () =>
    setFlashcards([...flashcards, { front: "", back: "" }]);

  const removeFlashcard = (i: number) =>
    setFlashcards(flashcards.filter((_, idx) => idx !== i));

  const updateFlashcard = (i: number, field: keyof FlashcardItem, value: string) =>
    setFlashcards(
      flashcards.map((f, idx) => (idx === i ? { ...f, [field]: value } : f))
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (!actor) {
      setSaveError("Actor not initialized. Please refresh and try again.");
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      const input: ChapterInput = {
        title: title.trim(),
        classNumber: classNumber.trim(),
        subject: subject.trim(),
        notesUrl: notesUrl1.trim(),
        notesUrl1: notesUrl1.trim(),
        notesLabel1: notesLabel1.trim(),
        notesUrl2: notesUrl2.trim(),
        notesLabel2: notesLabel2.trim(),
        audioLabel1: audioLabel1.trim(),
        audioLabel2: audioLabel2.trim(),
        audioUrl1: audioUrl1.trim(),
        audioUrl2: audioUrl2.trim(),
        quizQuestions: JSON.stringify(quizQuestions),
        flashcards: JSON.stringify(flashcards),
      };

      if (isEditing && chapter) {
        const success = await callWithRetry(
          () => actor.updateChapter(BigInt(chapter.id), input),
          "Update chapter"
        );
        if (!success) throw new Error("Failed to update chapter");
        updateChapter.mutate(
          { id: chapter.id, input },
          {
            onSuccess: () => {
              setIsSaving(false);
              onSuccess?.();
            },
            onError: () => {
              setIsSaving(false);
              onSuccess?.();
            },
          }
        );
      } else {
        await callWithRetry(
          () => actor.addChapter(input),
          "Create chapter"
        );
        setIsSaving(false);
        onSuccess?.();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed. Please try again.";
      setSaveError(msg);
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Info */}
      <div>
        <Label htmlFor="title">Chapter Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g. Cell Biology"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="classNumber">Class</Label>
          <Input
            id="classNumber"
            value={classNumber}
            onChange={(e) => setClassNumber(e.target.value)}
            required
            placeholder="e.g. 9"
          />
        </div>
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            placeholder="e.g. Biology"
          />
        </div>
      </div>

      {/* Notes URLs */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">Notes Links (optional)</Label>

        {/* Notes 1 */}
        <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes 1</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <Label htmlFor="notesLabel1" className="text-xs">Label (optional)</Label>
              <Input
                id="notesLabel1"
                value={notesLabel1}
                onChange={(e) => setNotesLabel1(e.target.value)}
                placeholder="e.g. Part 1, Chapter Summary"
              />
            </div>
            <div>
              <Label htmlFor="notesUrl1" className="text-xs">URL</Label>
              <Input
                id="notesUrl1"
                value={notesUrl1}
                onChange={(e) => setNotesUrl1(e.target.value)}
                placeholder="https://..."
                type="url"
              />
            </div>
          </div>
        </div>

        {/* Notes 2 */}
        <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes 2</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <Label htmlFor="notesLabel2" className="text-xs">Label (optional)</Label>
              <Input
                id="notesLabel2"
                value={notesLabel2}
                onChange={(e) => setNotesLabel2(e.target.value)}
                placeholder="e.g. Part 2, Extra Notes"
              />
            </div>
            <div>
              <Label htmlFor="notesUrl2" className="text-xs">URL</Label>
              <Input
                id="notesUrl2"
                value={notesUrl2}
                onChange={(e) => setNotesUrl2(e.target.value)}
                placeholder="https://..."
                type="url"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Audio URLs */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">Audio Links (optional)</Label>

        {/* Audio 1 */}
        <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Audio 1</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <Label htmlFor="audioLabel1" className="text-xs">Label (optional)</Label>
              <Input
                id="audioLabel1"
                value={audioLabel1}
                onChange={(e) => setAudioLabel1(e.target.value)}
                placeholder="e.g. Lecture 1, Part A"
              />
            </div>
            <div>
              <Label htmlFor="audioUrl1" className="text-xs">URL</Label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="audioUrl1"
                  value={audioUrl1}
                  onChange={(e) => setAudioUrl1(e.target.value)}
                  placeholder="Any link — YouTube, Google Drive, direct audio, etc."
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Audio 2 */}
        <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Audio 2</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <Label htmlFor="audioLabel2" className="text-xs">Label (optional)</Label>
              <Input
                id="audioLabel2"
                value={audioLabel2}
                onChange={(e) => setAudioLabel2(e.target.value)}
                placeholder="e.g. Lecture 2, Part B"
              />
            </div>
            <div>
              <Label htmlFor="audioUrl2" className="text-xs">URL</Label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="audioUrl2"
                  value={audioUrl2}
                  onChange={(e) => setAudioUrl2(e.target.value)}
                  placeholder="Any link — YouTube, Google Drive, direct audio, etc."
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Questions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Quiz Questions ({quizQuestions.length})</Label>
          <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
            <Plus className="w-4 h-4 mr-1" />
            Add Question
          </Button>
        </div>
        {quizQuestions.map((q, qi) => (
          <div key={qi} className="rounded-md border border-border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Question {qi + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeQuestion(qi)}
                className="text-destructive hover:text-destructive h-7 w-7"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <Input
              value={q.question}
              onChange={(e) => updateQuestion(qi, "question", e.target.value)}
              placeholder="Question text"
            />
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Options (click radio to mark correct)</Label>
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${qi}`}
                    checked={q.correctAnswer === oi}
                    onChange={() => updateQuestion(qi, "correctAnswer", oi)}
                    className="accent-primary"
                  />
                  <Input
                    value={opt}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                    placeholder={`Option ${oi + 1}`}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Flashcards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Flashcards ({flashcards.length})</Label>
          <Button type="button" variant="outline" size="sm" onClick={addFlashcard}>
            <Plus className="w-4 h-4 mr-1" />
            Add Card
          </Button>
        </div>
        {flashcards.map((f, fi) => (
          <div key={fi} className="rounded-md border border-border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Card {fi + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeFlashcard(fi)}
                className="text-destructive hover:text-destructive h-7 w-7"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <Input
              value={f.front}
              onChange={(e) => updateFlashcard(fi, "front", e.target.value)}
              placeholder="Front (question/term)"
            />
            <Input
              value={f.back}
              onChange={(e) => updateFlashcard(fi, "back", e.target.value)}
              placeholder="Back (answer/definition)"
            />
          </div>
        ))}
      </div>

      {/* Error */}
      {saveError && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {saveError}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving} className="flex-1">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSaving || !title.trim()} className="flex-1">
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            isEditing ? "Update Chapter" : "Save Chapter"
          )}
        </Button>
      </div>
    </form>
  );
}
