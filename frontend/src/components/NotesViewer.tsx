import { useState } from 'react';
import { ExternalLink, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-heading font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No Notes Available
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          Notes for this chapter haven't been added yet. Check back later!
        </p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-heading font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Unable to Load Notes
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
          The notes link may be broken or restricted. Try opening it directly.
        </p>
        <Button
          variant="outline"
          onClick={() => window.open(url, '_blank')}
          className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 gap-2"
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">Notes Viewer</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(url, '_blank')}
          className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Open in New Tab
        </Button>
      </div>
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <iframe
          src={embedUrl}
          className="w-full"
          style={{ height: '600px' }}
          title="Notes Viewer"
          allow="autoplay"
          onError={() => setHasError(true)}
        />
      </div>
    </div>
  );
}
