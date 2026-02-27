import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAddChapter, useUpdateChapter } from "../hooks/useQueries";
import type { Chapter, QuizQuestion, FlashcardItem } from "../types/chapter";
import type { ChapterInput } from "../backend";
import { Music, Upload, CheckCircle, AlertCircle, X, Plus, Trash2, Loader2 } from "lucide-react";
import { uploadAudioFileToDataUrl } from "../utils/audioUploadService";

interface ChapterFormProps {
  chapter?: Chapter;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ChapterForm({ chapter, onSuccess, onCancel }: ChapterFormProps) {
  const addChapter = useAddChapter();
  const updateChapter = useUpdateChapter();

  const [title, setTitle] = useState(chapter?.title ?? "");
  const [classNumber, setClassNumber] = useState(chapter?.classNumber ?? "");
  const [subject, setSubject] = useState(chapter?.subject ?? "");

  // Notes fields
  const [notesUrl1, setNotesUrl1] = useState(chapter?.notesUrl1 ?? chapter?.notesUrl ?? "");
  const [notesLabel1, setNotesLabel1] = useState(chapter?.notesLabel1 ?? "");
  const [notesUrl2, setNotesUrl2] = useState(chapter?.notesUrl2 ?? "");
  const [notesLabel2, setNotesLabel2] = useState(chapter?.notesLabel2 ?? "");

  // Audio 1 state
  const [audioLabel1, setAudioLabel1] = useState(chapter?.audioLabel1 ?? "");
  const [audioFile1, setAudioFile1] = useState<File | null>(null);
  const [audio1Progress, setAudio1Progress] = useState(0);
  const [audio1Status, setAudio1Status] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [audio1Error, setAudio1Error] = useState("");
  const audio1Ref = useRef<HTMLInputElement | null>(null);

  // Audio 2 state
  const [audioLabel2, setAudioLabel2] = useState(chapter?.audioLabel2 ?? "");
  const [audioFile2, setAudioFile2] = useState<File | null>(null);
  const [audio2Progress, setAudio2Progress] = useState(0);
  const [audio2Status, setAudio2Status] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [audio2Error, setAudio2Error] = useState("");
  const audio2Ref = useRef<HTMLInputElement | null>(null);

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(
    chapter?.quizQuestions ?? []
  );
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>(
    chapter?.flashcards ?? []
  );

  const isEditing = !!chapter;
  const hasExistingAudio1 = isEditing && (!!chapter?.audioUrl || chapter?.hasAudioBlob);
  const hasExistingAudio2 = isEditing && chapter?.hasAudioBlob2;

  const handleAudioFileChange = (
    slot: 1 | 2,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 200 * 1024 * 1024) {
      if (slot === 1) {
        setAudio1Error("File size exceeds 200MB limit.");
        setAudioFile1(null);
      } else {
        setAudio2Error("File size exceeds 200MB limit.");
        setAudioFile2(null);
      }
      return;
    }
    if (slot === 1) {
      setAudioFile1(file);
      setAudio1Status("idle");
      setAudio1Error("");
    } else {
      setAudioFile2(file);
      setAudio2Status("idle");
      setAudio2Error("");
    }
  };

  const clearAudioFile = (slot: 1 | 2) => {
    if (slot === 1) {
      setAudioFile1(null);
      setAudio1Status("idle");
      setAudio1Error("");
      setAudio1Progress(0);
      if (audio1Ref.current) audio1Ref.current.value = "";
    } else {
      setAudioFile2(null);
      setAudio2Status("idle");
      setAudio2Error("");
      setAudio2Progress(0);
      if (audio2Ref.current) audio2Ref.current.value = "";
    }
  };

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

    let audioUrl = chapter?.audioUrl ?? "";
    let audioMimeType = chapter?.audioMimeType ?? "audio/mpeg";
    let audioMimeType2 = chapter?.audioMimeType2 ?? "";

    // Upload audio 1 if selected
    if (audioFile1) {
      setAudio1Status("uploading");
      setAudio1Progress(0);
      try {
        const result = await uploadAudioFileToDataUrl(audioFile1, (pct) => {
          setAudio1Progress(pct);
        });
        audioUrl = result.dataUrl;
        audioMimeType = result.mimeType;
        setAudio1Status("success");
      } catch (err) {
        setAudio1Status("error");
        setAudio1Error(err instanceof Error ? err.message : "Audio 1 upload failed.");
        return;
      }
    }

    // Upload audio 2 if selected
    if (audioFile2) {
      setAudio2Status("uploading");
      setAudio2Progress(0);
      try {
        const result = await uploadAudioFileToDataUrl(audioFile2, (pct) => {
          setAudio2Progress(pct);
        });
        audioMimeType2 = result.mimeType;
        setAudio2Status("success");
      } catch (err) {
        setAudio2Status("error");
        setAudio2Error(err instanceof Error ? err.message : "Audio 2 upload failed.");
        return;
      }
    }

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
      audioUrl,
      audioMimeType,
      audioMimeType2,
      quizQuestions: JSON.stringify(quizQuestions),
      flashcards: JSON.stringify(flashcards),
    };

    if (isEditing && chapter) {
      updateChapter.mutate(
        { id: chapter.id, input },
        { onSuccess: () => onSuccess?.() }
      );
    } else {
      addChapter.mutate(input, { onSuccess: () => onSuccess?.() });
    }
  };

  const isSaving =
    addChapter.isPending ||
    updateChapter.isPending ||
    audio1Status === "uploading" ||
    audio2Status === "uploading";

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

      {/* Audio Uploads */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">Audio Files (optional)</Label>

        {/* Audio 1 */}
        <AudioUploadSlot
          slot={1}
          label={audioLabel1}
          onLabelChange={setAudioLabel1}
          file={audioFile1}
          progress={audio1Progress}
          status={audio1Status}
          error={audio1Error}
          hasExisting={!!hasExistingAudio1}
          inputRef={audio1Ref}
          onFileChange={(e) => handleAudioFileChange(1, e)}
          onClear={() => clearAudioFile(1)}
        />

        {/* Audio 2 */}
        <AudioUploadSlot
          slot={2}
          label={audioLabel2}
          onLabelChange={setAudioLabel2}
          file={audioFile2}
          progress={audio2Progress}
          status={audio2Status}
          error={audio2Error}
          hasExisting={!!hasExistingAudio2}
          inputRef={audio2Ref}
          onFileChange={(e) => handleAudioFileChange(2, e)}
          onClear={() => clearAudioFile(2)}
        />
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

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={!title.trim() || isSaving} className="flex-1">
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {audio1Status === "uploading" || audio2Status === "uploading"
                ? "Processing audio..."
                : "Saving..."}
            </>
          ) : isEditing ? (
            "Update Chapter"
          ) : (
            "Save Chapter"
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
        )}
      </div>

      {(addChapter.isError || updateChapter.isError) && (
        <p className="text-sm text-destructive">
          Failed to save chapter. Please try again.
        </p>
      )}
    </form>
  );
}

// ── Sub-component: AudioUploadSlot ────────────────────────────────────────────

interface AudioUploadSlotProps {
  slot: 1 | 2;
  label: string;
  onLabelChange: (v: string) => void;
  file: File | null;
  progress: number;
  status: "idle" | "uploading" | "success" | "error";
  error: string;
  hasExisting: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

function AudioUploadSlot({
  slot,
  label,
  onLabelChange,
  file,
  progress,
  status,
  error,
  hasExisting,
  inputRef,
  onFileChange,
  onClear,
}: AudioUploadSlotProps) {
  const inputId = `audioFile${slot}`;
  const labelId = `audioLabel${slot}`;

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Audio {slot}</p>

      <div>
        <Label htmlFor={labelId} className="text-xs">Label (optional)</Label>
        <Input
          id={labelId}
          value={label}
          onChange={(e) => onLabelChange(e.target.value)}
          placeholder={`e.g. Lecture ${slot}, Part ${slot}`}
        />
      </div>

      <div className="space-y-2">
        {hasExisting && !file && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>Audio file uploaded. Select a new file to replace it.</span>
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <label
            htmlFor={inputId}
            className="flex items-center gap-2 cursor-pointer rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <Upload className="h-4 w-4" />
            {file ? "Change file" : "Choose audio file"}
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="audio/*"
            onChange={onFileChange}
            className="hidden"
          />
          {file && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Music className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm truncate text-foreground">{file.name}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                ({(file.size / (1024 * 1024)).toFixed(1)} MB)
              </span>
              <button
                type="button"
                onClick={onClear}
                className="ml-auto shrink-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Supports MP3, WAV, OGG, M4A. Maximum size: 200MB.
        </p>

        {status === "uploading" && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Processing audio...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {status === "success" && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle className="h-4 w-4" />
            <span>Audio ready to save!</span>
          </div>
        )}

        {(status === "error" || error) && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error || "Audio processing failed. Please try again."}</span>
          </div>
        )}
      </div>
    </div>
  );
}
