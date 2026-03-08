import { Button } from "@/components/ui/button";
import { AlertCircle, Download, ExternalLink, FileText } from "lucide-react";
import { useState } from "react";

interface NotesViewerProps {
  url?: string;
}

function getEmbedUrl(url: string): string {
  const driveMatch = url.match(/\/file\/d\/([^/]+)/);
  if (driveMatch) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }
  return url;
}

export default function NotesViewer({ url }: NotesViewerProps) {
  const [hasError, setHasError] = useState(false);

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
          No Notes Available
        </h3>
        <p className="text-muted-foreground max-w-sm">
          Notes for this chapter haven't been added yet. Check back later!
        </p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
          Unable to Load Notes
        </h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          The notes link may be broken or restricted. Try opening it directly.
        </p>
        <Button
          variant="outline"
          onClick={() => window.open(url, "_blank")}
          className="gap-2"
          data-ocid="notes.button"
        >
          <ExternalLink className="w-4 h-4" />
          Open in New Tab
        </Button>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(url);

  return (
    <div className="flex flex-col gap-4">
      {/* Top action row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Notes Viewer</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(url, "_blank")}
          className="gap-2"
          data-ocid="notes.button"
        >
          <ExternalLink className="w-4 h-4" />
          Open in New Tab
        </Button>
      </div>

      {/* Embedded viewer */}
      <div className="rounded-xl border border-border overflow-hidden">
        <iframe
          src={embedUrl}
          className="w-full"
          style={{ height: "600px" }}
          title="Notes Viewer"
          allow="autoplay"
          onError={() => setHasError(true)}
        />
      </div>

      {/* Bottom download / open button */}
      <div className="pt-1">
        <Button
          variant="secondary"
          onClick={() => window.open(url, "_blank")}
          className="w-full sm:w-auto gap-2 font-semibold"
          size="lg"
          data-ocid="notes.secondary_button"
        >
          <Download className="w-4 h-4" />
          Download / Open Notes
        </Button>
      </div>
    </div>
  );
}
