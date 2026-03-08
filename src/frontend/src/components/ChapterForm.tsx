import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Link,
  Loader2,
} from "lucide-react";
import { useCallback, useState } from "react";
import type { ChapterInput } from "../backend";
import { useActor } from "../hooks/useActor";
import { useAddChapter, useUpdateChapter } from "../hooks/useQueries";
import type {
  Chapter,
  FlashcardItem,
  QuizQuestion,
  TrueFalseQuestion,
} from "../types/chapter";
import { callWithRetry } from "../utils/callWithRetry";

interface ChapterFormProps {
  chapter?: Chapter;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ── Quiz parser ───────────────────────────────────────────────────────────────

function parseQuizText(text: string): {
  questions: QuizQuestion[];
  error: boolean;
} {
  if (!text.trim()) return { questions: [], error: false };

  const questions: QuizQuestion[] = [];
  // Split by blank lines to get individual question blocks
  const blocks = text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;

    let questionText = "";
    const options: string[] = [];
    let correctAnswer = 0;
    let foundCorrect = false;
    let explanation = "";

    for (const line of lines) {
      // Question line: "Q:", "Q.", "1.", "1)", "2.", "2)" etc.
      if (/^(Q[:.]\s*|(\d+)[.)]\s*)/i.test(line)) {
        questionText = line.replace(/^(Q[:.]\s*|(\d+)[.)]\s*)/i, "").trim();
        continue;
      }
      // Option lines: "A)", "B)", "A.", "B." etc.
      const optMatch = line.match(/^([A-D])[.)]\s*(.+)/i);
      if (optMatch) {
        const letter = optMatch[1].toUpperCase();
        const optText = optMatch[2].trim();
        const idx = ["A", "B", "C", "D"].indexOf(letter);
        if (idx !== -1) {
          options[idx] = optText;
        }
        continue;
      }
      // Correct answer line: "Correct: B", "Answer: A", "Ans: C"
      const correctMatch = line.match(
        /^(correct|answer|ans)\s*[:.]\s*([A-D])/i,
      );
      if (correctMatch) {
        const letter = correctMatch[2].toUpperCase();
        correctAnswer = ["A", "B", "C", "D"].indexOf(letter);
        if (correctAnswer === -1) correctAnswer = 0;
        foundCorrect = true;
        continue;
      }
      // Explanation line: "Explanation: ..."
      const explMatch = line.match(/^explanation\s*[:.]\s*(.+)/i);
      if (explMatch) {
        explanation = explMatch[1].trim();
      }
    }

    // Need at least a question and some options to be valid
    if (questionText && options.filter(Boolean).length >= 2) {
      // Fill any missing options with empty strings so array length is always 4
      const filledOptions: string[] = ["", "", "", ""].map(
        (_, i) => options[i] ?? "",
      );
      const q: QuizQuestion = {
        question: questionText,
        options: filledOptions,
        correctAnswer: foundCorrect ? correctAnswer : 0,
      };
      if (explanation) q.explanation = explanation;
      questions.push(q);
    }
  }

  // If text was non-empty but no questions parsed, flag an error
  const error = text.trim().length > 10 && questions.length === 0;
  return { questions, error };
}

// ── True/False parser ─────────────────────────────────────────────────────────

function parseTrueFalseText(text: string): {
  questions: TrueFalseQuestion[];
  error: boolean;
} {
  if (!text.trim()) return { questions: [], error: false };

  const questions: TrueFalseQuestion[] = [];
  const blocks = text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;

    let statement = "";
    let answer: boolean | null = null;

    for (const line of lines) {
      // Statement line: "S: ..." or plain text if no answer yet
      const stmtMatch = line.match(/^S[:.]\s*(.+)/i);
      if (stmtMatch) {
        statement = stmtMatch[1].trim();
        continue;
      }
      // Answer line: "Answer: True" or "Answer: False"
      const ansMatch = line.match(/^answer\s*[:.]\s*(true|false)/i);
      if (ansMatch) {
        answer = ansMatch[1].toLowerCase() === "true";
        continue;
      }
      // If no S: prefix yet and no statement, treat plain line as statement
      if (!statement && !/^answer\s*[:.]/i.test(line)) {
        statement = line;
      }
    }

    if (statement && answer !== null) {
      questions.push({ statement, answer });
    }
  }

  const error = text.trim().length > 5 && questions.length === 0;
  return { questions, error };
}

// ── Flashcard parser ──────────────────────────────────────────────────────────

function parseFlashcardText(text: string): {
  cards: FlashcardItem[];
  error: boolean;
} {
  if (!text.trim()) return { cards: [], error: false };

  const cards: FlashcardItem[] = [];

  // Try Q:/A: pair format first (blocks separated by blank lines)
  const blocks = text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  let usedBlockFormat = false;

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    let front = "";
    let back = "";

    for (const line of lines) {
      if (/^Q[:.]\s*/i.test(line)) {
        front = line.replace(/^Q[:.]\s*/i, "").trim();
      } else if (/^A[:.]\s*/i.test(line)) {
        back = line.replace(/^A[:.]\s*/i, "").trim();
      }
    }

    if (front && back) {
      cards.push({ front, back });
      usedBlockFormat = true;
    }
  }

  // If block format found nothing, try pipe-separated format: "term | definition"
  if (!usedBlockFormat) {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    for (const line of lines) {
      const pipeIdx = line.indexOf("|");
      if (pipeIdx !== -1) {
        const front = line.slice(0, pipeIdx).trim();
        const back = line.slice(pipeIdx + 1).trim();
        if (front && back) {
          cards.push({ front, back });
        }
      }
    }
  }

  const error = text.trim().length > 5 && cards.length === 0;
  return { cards, error };
}

// ── Format-help collapsible ───────────────────────────────────────────────────

function FormatHelp({ type }: { type: "quiz" | "flashcard" | "trueFalse" }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1 text-xs text-primary hover:underline focus-visible:outline-none"
      >
        {open ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
        Format help
      </button>

      {open && (
        <div className="mt-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground space-y-2">
          {type === "quiz" ? (
            <>
              <p className="font-semibold text-foreground">
                Quiz format (separate questions with a blank line):
              </p>
              <pre className="whitespace-pre-wrap font-mono bg-background rounded p-2 text-[11px] leading-relaxed border border-border">
                {`Q: What is photosynthesis?
A) Breathing process
B) Food making by plants
C) Water absorption
D) Cell division
Correct: B
Explanation: Plants use sunlight to convert CO2 and water into glucose, producing food.

Q: What is osmosis?
A) Diffusion of water
B) Gas exchange
C) Protein synthesis
D) Cell division
Correct: A`}
              </pre>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <strong>Q:</strong> or <strong>1.</strong> starts a question
                </li>
                <li>
                  <strong>A)</strong> B) C) D) are the options
                </li>
                <li>
                  <strong>Correct: B</strong> marks the right answer (A–D)
                </li>
                <li>
                  <strong>Explanation:</strong> is optional — adds a "why" shown
                  after answering
                </li>
                <li>Blank line separates questions</li>
              </ul>
            </>
          ) : type === "trueFalse" ? (
            <>
              <p className="font-semibold text-foreground">
                True/False format (separate questions with a blank line):
              </p>
              <pre className="whitespace-pre-wrap font-mono bg-background rounded p-2 text-[11px] leading-relaxed border border-border">
                {`S: The sun is a star
Answer: True

S: Photosynthesis occurs in animals
Answer: False

S: Water boils at 100°C at sea level
Answer: True`}
              </pre>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <strong>S:</strong> starts the statement
                </li>
                <li>
                  <strong>Answer: True</strong> or{" "}
                  <strong>Answer: False</strong> marks the answer
                </li>
                <li>Blank line separates questions</li>
              </ul>
            </>
          ) : (
            <>
              <p className="font-semibold text-foreground">
                Flashcard format — choose one style:
              </p>
              <p className="font-medium text-foreground">
                Style 1 — Q/A pairs (blank line between cards):
              </p>
              <pre className="whitespace-pre-wrap font-mono bg-background rounded p-2 text-[11px] leading-relaxed border border-border">
                {`Q: Mitochondria
A: Powerhouse of the cell

Q: Nucleus
A: Control center of the cell`}
              </pre>
              <p className="font-medium text-foreground">
                Style 2 — Pipe separator (one card per line):
              </p>
              <pre className="whitespace-pre-wrap font-mono bg-background rounded p-2 text-[11px] leading-relaxed border border-border">
                {`Mitochondria | Powerhouse of the cell
Nucleus | Control center of the cell
Chloroplast | Site of photosynthesis`}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ChapterForm({
  chapter,
  onSuccess,
  onCancel,
}: ChapterFormProps) {
  // addChapter is called via actor directly; hook kept for cache invalidation
  const _addChapter = useAddChapter();
  const updateChapter = useUpdateChapter();
  const { actor } = useActor();

  const [title, setTitle] = useState(chapter?.title ?? "");
  const [classNumber, setClassNumber] = useState(chapter?.classNumber ?? "");
  const [subject, setSubject] = useState(chapter?.subject ?? "");

  // Notes fields
  const [notesUrl1, setNotesUrl1] = useState(
    chapter?.notesUrl1 ?? chapter?.notesUrl ?? "",
  );
  const [notesLabel1, setNotesLabel1] = useState(chapter?.notesLabel1 ?? "");
  const [notesUrl2, setNotesUrl2] = useState(chapter?.notesUrl2 ?? "");
  const [notesLabel2, setNotesLabel2] = useState(chapter?.notesLabel2 ?? "");

  // Audio URL fields
  const [audioLabel1, setAudioLabel1] = useState(chapter?.audioLabel1 ?? "");
  const [audioUrl1, setAudioUrl1] = useState(chapter?.audioUrl1 ?? "");
  const [audioLabel2, setAudioLabel2] = useState(chapter?.audioLabel2 ?? "");
  const [audioUrl2, setAudioUrl2] = useState(chapter?.audioUrl2 ?? "");

  // Paste-based quiz input
  const [quizText, setQuizText] = useState(() => {
    // Re-hydrate from saved questions on edit
    if (chapter?.quizQuestions && chapter.quizQuestions.length > 0) {
      return chapter.quizQuestions
        .map((q) => {
          const optLetters = ["A", "B", "C", "D"];
          const optLines = q.options
            .map((o, oi) => `${optLetters[oi]}) ${o}`)
            .join("\n");
          const correct = optLetters[q.correctAnswer] ?? "A";
          const explLine = q.explanation
            ? `\nExplanation: ${q.explanation}`
            : "";
          return `Q: ${q.question}\n${optLines}\nCorrect: ${correct}${explLine}`;
        })
        .join("\n\n");
    }
    return "";
  });

  // Paste-based flashcard input
  const [flashcardText, setFlashcardText] = useState(() => {
    if (chapter?.flashcards && chapter.flashcards.length > 0) {
      return chapter.flashcards
        .map((f) => `Q: ${f.front}\nA: ${f.back}`)
        .join("\n\n");
    }
    return "";
  });

  // Paste-based True/False input
  const [trueFalseText, setTrueFalseText] = useState(() => {
    if (chapter?.trueFalseQuestions && chapter.trueFalseQuestions.length > 0) {
      return chapter.trueFalseQuestions
        .map((q) => `S: ${q.statement}\nAnswer: ${q.answer ? "True" : "False"}`)
        .join("\n\n");
    }
    return "";
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const isEditing = !!chapter;

  // Live-parsed results (derived, no state needed)
  const { questions: parsedQuestions, error: quizParseError } =
    parseQuizText(quizText);
  const { cards: parsedCards, error: flashcardParseError } =
    parseFlashcardText(flashcardText);
  const { questions: parsedTrueFalse, error: trueFalseParseError } =
    parseTrueFalseText(trueFalseText);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
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
          quizQuestions: JSON.stringify(parsedQuestions),
          flashcards: JSON.stringify(parsedCards),
          trueFalseQuestions: JSON.stringify(parsedTrueFalse),
        };

        if (isEditing && chapter) {
          const success = await callWithRetry(
            () => actor.updateChapter(BigInt(chapter.id), input),
            "Update chapter",
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
            },
          );
        } else {
          await callWithRetry(() => actor.addChapter(input), "Create chapter");
          setIsSaving(false);
          onSuccess?.();
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Save failed. Please try again.";
        setSaveError(msg);
        setIsSaving(false);
      }
    },
    [
      title,
      classNumber,
      subject,
      notesUrl1,
      notesLabel1,
      notesUrl2,
      notesLabel2,
      audioLabel1,
      audioUrl1,
      audioLabel2,
      audioUrl2,
      parsedQuestions,
      parsedCards,
      parsedTrueFalse,
      actor,
      isEditing,
      chapter,
      updateChapter,
      onSuccess,
    ],
  );

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
          data-ocid="chapter.input"
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
            data-ocid="chapter.input"
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
            data-ocid="chapter.input"
          />
        </div>
      </div>

      {/* Notes URLs */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">
          Notes Links (optional)
        </Label>

        {/* Notes 1 */}
        <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Notes 1
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <Label htmlFor="notesLabel1" className="text-xs">
                Label (optional)
              </Label>
              <Input
                id="notesLabel1"
                value={notesLabel1}
                onChange={(e) => setNotesLabel1(e.target.value)}
                placeholder="e.g. Part 1, Chapter Summary"
              />
            </div>
            <div>
              <Label htmlFor="notesUrl1" className="text-xs">
                URL
              </Label>
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
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Notes 2
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <Label htmlFor="notesLabel2" className="text-xs">
                Label (optional)
              </Label>
              <Input
                id="notesLabel2"
                value={notesLabel2}
                onChange={(e) => setNotesLabel2(e.target.value)}
                placeholder="e.g. Part 2, Extra Notes"
              />
            </div>
            <div>
              <Label htmlFor="notesUrl2" className="text-xs">
                URL
              </Label>
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
        <Label className="text-sm font-semibold text-foreground">
          Audio Links (optional)
        </Label>

        {/* Audio 1 */}
        <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Audio 1
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <Label htmlFor="audioLabel1" className="text-xs">
                Label (optional)
              </Label>
              <Input
                id="audioLabel1"
                value={audioLabel1}
                onChange={(e) => setAudioLabel1(e.target.value)}
                placeholder="e.g. Lecture 1, Part A"
              />
            </div>
            <div>
              <Label htmlFor="audioUrl1" className="text-xs">
                URL
              </Label>
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
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Audio 2
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <Label htmlFor="audioLabel2" className="text-xs">
                Label (optional)
              </Label>
              <Input
                id="audioLabel2"
                value={audioLabel2}
                onChange={(e) => setAudioLabel2(e.target.value)}
                placeholder="e.g. Lecture 2, Part B"
              />
            </div>
            <div>
              <Label htmlFor="audioUrl2" className="text-xs">
                URL
              </Label>
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

      {/* ── Quiz — paste all at once ─────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label
          htmlFor="quizText"
          className="text-sm font-semibold text-foreground"
        >
          Quiz Questions (optional) — paste all at once
        </Label>
        <Textarea
          id="quizText"
          value={quizText}
          onChange={(e) => setQuizText(e.target.value)}
          rows={8}
          placeholder={`Q: What is photosynthesis?
A) Breathing process
B) Food making by plants
C) Water absorption
D) Cell division
Correct: B

Q: What is osmosis?
A) Diffusion of water
B) Gas exchange
C) Protein synthesis
D) Cell division
Correct: A`}
          className="font-mono text-sm resize-y"
          data-ocid="chapter.textarea"
        />

        {/* Live parse feedback */}
        <div className="flex items-center gap-2 text-xs">
          {quizText.trim() === "" ? (
            <span className="text-muted-foreground">
              No quiz questions entered
            </span>
          ) : quizParseError ? (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-destructive" />
              <span className="text-destructive">
                Could not parse — check format
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              <span className="text-green-700 dark:text-green-400 font-medium">
                {parsedQuestions.length} question
                {parsedQuestions.length !== 1 ? "s" : ""} parsed
              </span>
            </>
          )}
        </div>

        <FormatHelp type="quiz" />
      </div>

      {/* ── Flashcards — paste all at once ──────────────────────────────────── */}
      <div className="space-y-2">
        <Label
          htmlFor="flashcardText"
          className="text-sm font-semibold text-foreground"
        >
          Flashcards (optional) — paste all at once
        </Label>
        <Textarea
          id="flashcardText"
          value={flashcardText}
          onChange={(e) => setFlashcardText(e.target.value)}
          rows={6}
          placeholder={`Q: Mitochondria
A: Powerhouse of the cell

Q: Nucleus
A: Control center of the cell

— OR use pipe style —

Mitochondria | Powerhouse of the cell
Nucleus | Control center of the cell`}
          className="font-mono text-sm resize-y"
          data-ocid="chapter.textarea"
        />

        {/* Live parse feedback */}
        <div className="flex items-center gap-2 text-xs">
          {flashcardText.trim() === "" ? (
            <span className="text-muted-foreground">No flashcards entered</span>
          ) : flashcardParseError ? (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-destructive" />
              <span className="text-destructive">
                Could not parse — check format
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              <span className="text-green-700 dark:text-green-400 font-medium">
                {parsedCards.length} card{parsedCards.length !== 1 ? "s" : ""}{" "}
                parsed
              </span>
            </>
          )}
        </div>

        <FormatHelp type="flashcard" />
      </div>

      {/* ── True/False — paste all at once ──────────────────────────────────── */}
      <div className="space-y-2">
        <Label
          htmlFor="trueFalseText"
          className="text-sm font-semibold text-foreground"
        >
          True/False Questions (optional) — paste all at once
        </Label>
        <Textarea
          id="trueFalseText"
          value={trueFalseText}
          onChange={(e) => setTrueFalseText(e.target.value)}
          rows={6}
          placeholder={`S: The sun is a star
Answer: True

S: Photosynthesis occurs in animals
Answer: False

S: Water boils at 100°C at sea level
Answer: True`}
          className="font-mono text-sm resize-y"
          data-ocid="chapter.textarea"
        />

        {/* Live parse feedback */}
        <div className="flex items-center gap-2 text-xs">
          {trueFalseText.trim() === "" ? (
            <span className="text-muted-foreground">
              No true/false questions entered
            </span>
          ) : trueFalseParseError ? (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-destructive" />
              <span className="text-destructive">
                Could not parse — check format
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              <span className="text-green-700 dark:text-green-400 font-medium">
                {parsedTrueFalse.length} question
                {parsedTrueFalse.length !== 1 ? "s" : ""} parsed
              </span>
            </>
          )}
        </div>

        <FormatHelp type="trueFalse" />
      </div>

      {/* Error */}
      {saveError && (
        <p
          className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2"
          data-ocid="chapter.error_state"
        >
          {saveError}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1"
            data-ocid="chapter.cancel_button"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSaving || !title.trim()}
          className="flex-1"
          data-ocid="chapter.save_button"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            "Update Chapter"
          ) : (
            "Save Chapter"
          )}
        </Button>
      </div>
    </form>
  );
}
