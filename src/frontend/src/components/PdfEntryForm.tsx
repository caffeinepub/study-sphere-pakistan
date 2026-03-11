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
import { useAddPdfEntry, useUpdatePdfEntry } from "../hooks/useQueries";
import type { PdfEntry } from "../types/chapter";

interface PdfEntryFormProps {
  pdfEntry?: PdfEntry;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PdfEntryForm({
  pdfEntry,
  onSuccess,
  onCancel,
}: PdfEntryFormProps) {
  const [title, setTitle] = useState(pdfEntry?.title ?? "");
  const [entryType, setEntryType] = useState(
    pdfEntry?.entryType ?? "past-paper",
  );
  const [url, setUrl] = useState(pdfEntry?.url ?? "");

  const addMutation = useAddPdfEntry();
  const updateMutation = useUpdatePdfEntry();
  const isPending = addMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    if (pdfEntry) {
      await updateMutation.mutateAsync({
        id: pdfEntry.id,
        title: title.trim(),
        entryType,
        url: url.trim(),
      });
    } else {
      await addMutation.mutateAsync({
        title: title.trim(),
        entryType,
        url: url.trim(),
      });
    }
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-4">
      <div className="space-y-2">
        <Label htmlFor="pdf-title">Title *</Label>
        <Input
          id="pdf-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. MDCAT 2023 Past Paper"
          required
          data-ocid="pdf.title.input"
        />
      </div>

      <div className="space-y-2">
        <Label>Type</Label>
        <Select value={entryType} onValueChange={setEntryType}>
          <SelectTrigger data-ocid="pdf.type.select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="past-paper">Past Paper</SelectItem>
            <SelectItem value="practice-test">Practice Test</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pdf-url">PDF URL *</Label>
        <Input
          id="pdf-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          required
          data-ocid="pdf.url.input"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isPending || !title.trim() || !url.trim()}
          className="flex-1"
          data-ocid="pdf.save_button"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Saving..." : pdfEntry ? "Update Entry" : "Save Entry"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            data-ocid="pdf.cancel_button"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
