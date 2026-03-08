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
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAddPdfEntry, useUpdatePdfEntry } from "../hooks/useQueries";
import type { PdfEntry } from "../types/chapter";

interface PdfEntryFormProps {
  entry?: PdfEntry;
  onSave: () => void;
  onCancel: () => void;
}

export default function PdfEntryForm({
  entry,
  onSave,
  onCancel,
}: PdfEntryFormProps) {
  const [title, setTitle] = useState(entry?.title ?? "");
  const [entryType, setEntryType] = useState<string>(
    entry?.entryType ?? "past-paper",
  );
  const [url, setUrl] = useState(entry?.url ?? "");

  const addPdfMutation = useAddPdfEntry();
  const updatePdfMutation = useUpdatePdfEntry();

  const isEditing = !!entry;
  const isPending = addPdfMutation.isPending || updatePdfMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    const input = {
      title: title.trim(),
      entryType,
      url: url.trim(),
    };

    try {
      if (isEditing && entry) {
        await updatePdfMutation.mutateAsync({ id: entry.id, input });
      } else {
        await addPdfMutation.mutateAsync(input);
      }
      onSave();
    } catch (err) {
      console.error("Failed to save PDF entry:", err);
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
            {isEditing ? "Edit PDF Entry" : "Add PDF Entry"}
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. MDCAT 2023 Past Paper"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={entryType} onValueChange={(v) => setEntryType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="past-paper">Past Paper</SelectItem>
                <SelectItem value="practice-test">Practice Test</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">PDF URL *</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              required
            />
          </div>

          <div className="flex gap-3 pt-2 pb-8">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || !url.trim() || isPending}
              className="flex-1"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Update Entry"
              ) : (
                "Save Entry"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
