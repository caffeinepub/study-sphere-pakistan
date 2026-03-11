import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAddTopic, useUpdateTopic } from "../hooks/useQueries";
import type {
  FlashcardItem,
  QuizQuestion,
  Topic,
  TrueFalseQuestion,
} from "../types/chapter";

interface TopicFormProps {
  chapterId: string;
  topic?: Topic;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ── Parsers ──────────────────────────────────────────────────────────────────

function parseQuizText(text: string): QuizQuestion[] {
  if (!text.trim()) return [];
  const questions: QuizQuestion[] = [];
  const blocks = text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    let questionText = "";
    const options: string[] = [];
    let correctAnswer = 0;
    let explanation = "";
    for (const line of lines) {
      if (/^(Q[:.] *|\d+[.)\s])/i.test(line)) {
        questionText = line.replace(/^(Q[:.] *|\d+[.)\s]+)/i, "").trim();
        continue;
      }
      const optMatch = line.match(/^([A-D])[.)\s]+(.+)/i);
      if (optMatch) {
        const idx = ["A", "B", "C", "D"].indexOf(optMatch[1].toUpperCase());
        if (idx !== -1) options[idx] = optMatch[2].trim();
        continue;
      }
      const correctMatch = line.match(
        /^(correct|answer|ans)\s*[:.\s]+([A-D])/i,
      );
      if (correctMatch) {
        correctAnswer = ["A", "B", "C", "D"].indexOf(
          correctMatch[2].toUpperCase(),
        );
        continue;
      }
      if (/^explanation\s*[:.]/i.test(line)) {
        explanation = line.replace(/^explanation\s*[:.]/i, "").trim();
      }
    }
    if (questionText && options.length > 0) {
      questions.push({
        question: questionText,
        options: options.filter(Boolean),
        correctAnswer,
        explanation,
      });
    }
  }
  return questions;
}

function parseFlashcardText(text: string): FlashcardItem[] {
  if (!text.trim()) return [];
  const cards: FlashcardItem[] = [];
  const blocks = text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    let front = "";
    let back = "";
    for (const line of lines) {
      if (/^front\s*[:.]/i.test(line))
        front = line.replace(/^front\s*[:.]/i, "").trim();
      else if (/^back\s*[:.]/i.test(line))
        back = line.replace(/^back\s*[:.]/i, "").trim();
    }
    if (front || back) cards.push({ front, back });
  }
  return cards;
}

function parseTrueFalseText(text: string): TrueFalseQuestion[] {
  if (!text.trim()) return [];
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
    let statement = "";
    let answer = true;
    for (const line of lines) {
      if (/^s\s*[:.]/i.test(line))
        statement = line.replace(/^s\s*[:.]/i, "").trim();
      else if (/^(answer|ans)\s*[:.]/i.test(line)) {
        const val = line
          .replace(/^(answer|ans)\s*[:.]/i, "")
          .trim()
          .toLowerCase();
        answer = val === "true";
      }
    }
    if (statement) questions.push({ statement, answer });
  }
  return questions;
}

export default function TopicForm({
  chapterId,
  topic,
  onSuccess,
  onCancel,
}: TopicFormProps) {
  const [title, setTitle] = useState(topic?.title ?? "");
  const [notesUrl1, setNotesUrl1] = useState(topic?.notesUrl1 ?? "");
  const [notesLabel1, setNotesLabel1] = useState(topic?.notesLabel1 ?? "");
  const [notesUrl2, setNotesUrl2] = useState(topic?.notesUrl2 ?? "");
  const [notesLabel2, setNotesLabel2] = useState(topic?.notesLabel2 ?? "");
  const [audioUrl1, setAudioUrl1] = useState(topic?.audioUrl1 ?? "");
  const [audioLabel1, setAudioLabel1] = useState(topic?.audioLabel1 ?? "");
  const [audioUrl2, setAudioUrl2] = useState(topic?.audioUrl2 ?? "");
  const [audioLabel2, setAudioLabel2] = useState(topic?.audioLabel2 ?? "");
  const [quizText, setQuizText] = useState(() => {
    if (!topic?.quizQuestions.length) return "";
    return topic.quizQuestions
      .map((q) => {
        const opts = ["A", "B", "C", "D"]
          .map((l, i) => (q.options[i] ? `${l}) ${q.options[i]}` : null))
          .filter(Boolean)
          .join("\n");
        const correct = ["A", "B", "C", "D"][q.correctAnswer] ?? "A";
        const exp = q.explanation ? `\nExplanation: ${q.explanation}` : "";
        return `Q: ${q.question}\n${opts}\nCorrect: ${correct}${exp}`;
      })
      .join("\n\n");
  });
  const [flashcardText, setFlashcardText] = useState(() => {
    if (!topic?.flashcards.length) return "";
    return topic.flashcards
      .map((f) => `Front: ${f.front}\nBack: ${f.back}`)
      .join("\n\n");
  });
  const [trueFalseText, setTrueFalseText] = useState(() => {
    if (!topic?.trueFalseQuestions.length) return "";
    return topic.trueFalseQuestions
      .map((q) => `S: ${q.statement}\nAnswer: ${q.answer ? "True" : "False"}`)
      .join("\n\n");
  });

  const [saved, setSaved] = useState(false);
  const addMutation = useAddTopic();
  const updateMutation = useUpdateTopic();
  const isPending = addMutation.isPending || updateMutation.isPending;

  const buildInput = () => ({
    chapterId: BigInt(chapterId),
    title: title.trim(),
    notesUrl1: notesUrl1.trim(),
    notesLabel1: notesLabel1.trim(),
    notesUrl2: notesUrl2.trim(),
    notesLabel2: notesLabel2.trim(),
    audioUrl1: audioUrl1.trim(),
    audioLabel1: audioLabel1.trim(),
    audioUrl2: audioUrl2.trim(),
    audioLabel2: audioLabel2.trim(),
    quizQuestions: JSON.stringify(parseQuizText(quizText)),
    flashcards: JSON.stringify(parseFlashcardText(flashcardText)),
    trueFalseQuestions: JSON.stringify(parseTrueFalseText(trueFalseText)),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const input = buildInput();
    if (topic) {
      await updateMutation.mutateAsync({ id: topic.id, input });
    } else {
      await addMutation.mutateAsync(input);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="topic-title">Topic Title *</Label>
        <Input
          id="topic-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Cell Structure and Function"
          required
          data-ocid="topic.title.input"
        />
      </div>

      {/* Notes */}
      <div className="space-y-3 p-4 rounded-lg border border-border bg-card">
        <h3 className="font-semibold text-foreground">Notes (optional)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Notes 1 URL</Label>
            <Input
              value={notesUrl1}
              onChange={(e) => setNotesUrl1(e.target.value)}
              placeholder="https://drive.google.com/..."
              data-ocid="topic.notes1.input"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Notes 1 Label
            </Label>
            <Input
              value={notesLabel1}
              onChange={(e) => setNotesLabel1(e.target.value)}
              placeholder="e.g. Part 1"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Notes 2 URL</Label>
            <Input
              value={notesUrl2}
              onChange={(e) => setNotesUrl2(e.target.value)}
              placeholder="https://drive.google.com/..."
              data-ocid="topic.notes2.input"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Notes 2 Label
            </Label>
            <Input
              value={notesLabel2}
              onChange={(e) => setNotesLabel2(e.target.value)}
              placeholder="e.g. Part 2"
            />
          </div>
        </div>
      </div>

      {/* Audio */}
      <div className="space-y-3 p-4 rounded-lg border border-border bg-card">
        <h3 className="font-semibold text-foreground">
          Audio Lectures (optional)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Audio 1 URL</Label>
            <Input
              value={audioUrl1}
              onChange={(e) => setAudioUrl1(e.target.value)}
              placeholder="Any audio/video link"
              data-ocid="topic.audio1.input"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Audio 1 Label
            </Label>
            <Input
              value={audioLabel1}
              onChange={(e) => setAudioLabel1(e.target.value)}
              placeholder="e.g. Lecture 1"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Audio 2 URL</Label>
            <Input
              value={audioUrl2}
              onChange={(e) => setAudioUrl2(e.target.value)}
              placeholder="Any audio/video link"
              data-ocid="topic.audio2.input"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Audio 2 Label
            </Label>
            <Input
              value={audioLabel2}
              onChange={(e) => setAudioLabel2(e.target.value)}
              placeholder="e.g. Lecture 2"
            />
          </div>
        </div>
      </div>

      {/* Quiz */}
      <div className="space-y-2 p-4 rounded-lg border border-border bg-card">
        <h3 className="font-semibold text-foreground">
          Quiz Questions (optional)
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Paste questions separated by blank lines. Format per question:
          <br />
          <code className="bg-muted px-1 rounded">Q: Question text</code>
          <br />
          <code className="bg-muted px-1 rounded">A) Option A</code>
          <br />
          <code className="bg-muted px-1 rounded">B) Option B</code>
          <br />
          <code className="bg-muted px-1 rounded">C) Option C</code>
          <br />
          <code className="bg-muted px-1 rounded">D) Option D</code>
          <br />
          <code className="bg-muted px-1 rounded">Correct: B</code>
          <br />
          <code className="bg-muted px-1 rounded">
            Explanation: Why B is correct
          </code>{" "}
          (optional)
        </p>
        <Textarea
          value={quizText}
          onChange={(e) => setQuizText(e.target.value)}
          placeholder="Q: What is the powerhouse of the cell?&#10;A) Nucleus&#10;B) Mitochondria&#10;C) Ribosome&#10;D) Vacuole&#10;Correct: B&#10;Explanation: Mitochondria produces ATP energy"
          rows={8}
          className="font-mono text-sm"
          data-ocid="topic.quiz.textarea"
        />
        {quizText.trim() && (
          <p className="text-xs text-muted-foreground">
            Parsed: {parseQuizText(quizText).length} question(s)
          </p>
        )}
      </div>

      {/* Flashcards */}
      <div className="space-y-2 p-4 rounded-lg border border-border bg-card">
        <h3 className="font-semibold text-foreground">Flashcards (optional)</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Paste cards separated by blank lines. Format:
          <br />
          <code className="bg-muted px-1 rounded">Front: Term or question</code>
          <br />
          <code className="bg-muted px-1 rounded">
            Back: Definition or answer
          </code>
        </p>
        <Textarea
          value={flashcardText}
          onChange={(e) => setFlashcardText(e.target.value)}
          placeholder="Front: Mitochondria&#10;Back: Powerhouse of the cell, produces ATP"
          rows={6}
          className="font-mono text-sm"
          data-ocid="topic.flashcards.textarea"
        />
        {flashcardText.trim() && (
          <p className="text-xs text-muted-foreground">
            Parsed: {parseFlashcardText(flashcardText).length} card(s)
          </p>
        )}
      </div>

      {/* True/False */}
      <div className="space-y-2 p-4 rounded-lg border border-border bg-card">
        <h3 className="font-semibold text-foreground">
          True / False Questions (optional)
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Paste questions separated by blank lines. Format:
          <br />
          <code className="bg-muted px-1 rounded">S: Statement text</code>
          <br />
          <code className="bg-muted px-1 rounded">Answer: True</code> (or False)
        </p>
        <Textarea
          value={trueFalseText}
          onChange={(e) => setTrueFalseText(e.target.value)}
          placeholder="S: The mitochondria produces ATP energy&#10;Answer: True"
          rows={6}
          className="font-mono text-sm"
          data-ocid="topic.truefalse.textarea"
        />
        {trueFalseText.trim() && (
          <p className="text-xs text-muted-foreground">
            Parsed: {parseTrueFalseText(trueFalseText).length} question(s)
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isPending || !title.trim()}
          className="flex-1"
          data-ocid="topic.save_button"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Saved!
            </>
          ) : topic ? (
            "Update Topic"
          ) : (
            "Add Topic"
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            data-ocid="topic.cancel_button"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
