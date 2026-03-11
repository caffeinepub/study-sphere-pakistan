import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useAddChapter, useUpdateChapter } from "../hooks/useQueries";
import type { Chapter } from "../types/chapter";

interface ChapterFormProps {
  chapter?: Chapter;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const GRADE_OPTIONS = [
  { value: "9", label: "9th Class (Matric Part 1)" },
  { value: "10", label: "10th Class (Matric Part 2)" },
  { value: "11", label: "11th Class (FSc Part 1)" },
  { value: "12", label: "12th Class (FSc Part 2)" },
  { value: "MDCAT", label: "MDCAT" },
];

const SUBJECT_OPTIONS: Record<string, { value: string; label: string }[]> = {
  "9": [
    { value: "English", label: "English" },
    { value: "Biology", label: "Biology" },
    { value: "Chemistry", label: "Chemistry" },
    { value: "Physics", label: "Physics" },
  ],
  "10": [
    { value: "English", label: "English" },
    { value: "Biology", label: "Biology" },
    { value: "Chemistry", label: "Chemistry" },
    { value: "Physics", label: "Physics" },
  ],
  "11": [
    { value: "English", label: "English" },
    { value: "Biology", label: "Biology" },
    { value: "Chemistry", label: "Chemistry" },
    { value: "Physics", label: "Physics" },
  ],
  "12": [
    { value: "English", label: "English" },
    { value: "Biology", label: "Biology" },
    { value: "Chemistry", label: "Chemistry" },
    { value: "Physics", label: "Physics" },
  ],
  MDCAT: [
    { value: "Biology", label: "Biology" },
    { value: "Chemistry", label: "Chemistry" },
    { value: "Physics", label: "Physics" },
    { value: "English", label: "English" },
    { value: "Logical Reasoning", label: "Logical Reasoning" },
  ],
};

export default function ChapterForm({
  chapter,
  onSuccess,
  onCancel,
}: ChapterFormProps) {
  const [title, setTitle] = useState(chapter?.title ?? "");
  const [classNumber, setClassNumber] = useState(chapter?.classNumber ?? "");
  const [subject, setSubject] = useState(chapter?.subject ?? "");

  const addMutation = useAddChapter();
  const updateMutation = useUpdateChapter();
  const isPending = addMutation.isPending || updateMutation.isPending;

  const subjectOptions = classNumber
    ? (SUBJECT_OPTIONS[classNumber] ?? [])
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !classNumber || !subject) return;

    if (chapter) {
      await updateMutation.mutateAsync({
        id: chapter.id,
        title: title.trim(),
        classNumber,
        subject,
      });
    } else {
      await addMutation.mutateAsync({
        title: title.trim(),
        classNumber,
        subject,
      });
    }
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-4">
      <div className="space-y-2">
        <Label htmlFor="chapter-title">Chapter Title *</Label>
        <Input
          id="chapter-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Introduction to Biology"
          required
          data-ocid="chapter.title.input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="chapter-class">Class / Grade *</Label>
        <Select
          value={classNumber}
          onValueChange={(v) => {
            setClassNumber(v);
            setSubject("");
          }}
        >
          <SelectTrigger id="chapter-class" data-ocid="chapter.class.select">
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {GRADE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="chapter-subject">Subject *</Label>
        <Select
          value={subject}
          onValueChange={setSubject}
          disabled={!classNumber}
        >
          <SelectTrigger
            id="chapter-subject"
            data-ocid="chapter.subject.select"
          >
            <SelectValue
              placeholder={
                classNumber ? "Select subject" : "Select class first"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {subjectOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isPending || !title.trim() || !classNumber || !subject}
          className="flex-1"
          data-ocid="chapter.save_button"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Saving..." : chapter ? "Update Chapter" : "Add Chapter"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            data-ocid="chapter.cancel_button"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
