import { useNavigate } from '@tanstack/react-router';
import type { Chapter } from '../types/chapter';
import { BookOpen, CheckCircle, FileText, Music, HelpCircle, Layers } from 'lucide-react';
import { isChapterCompleted } from '../utils/storageService';

interface ChapterCardProps {
  chapter: Chapter;
}

export default function ChapterCard({ chapter }: ChapterCardProps) {
  const navigate = useNavigate();
  const done = isChapterCompleted(chapter.id);

  const features = [
    chapter.notesUrl && { icon: FileText, label: 'Notes' },
    chapter.audioUrl && { icon: Music, label: 'Audio' },
    chapter.quizQuestions && chapter.quizQuestions.length > 0 && { icon: HelpCircle, label: 'Quiz' },
    chapter.flashcards && chapter.flashcards.length > 0 && { icon: Layers, label: 'Cards' },
  ].filter(Boolean) as { icon: React.ElementType; label: string }[];

  return (
    <button
      onClick={() => navigate({ to: '/chapter/$chapterId', params: { chapterId: chapter.id } })}
      className="w-full text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:border-primary dark:hover:border-blue-500 hover:shadow-md dark:hover:shadow-gray-900/50 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary dark:bg-blue-600 flex items-center justify-center shrink-0 shadow-sm">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-semibold text-sm leading-snug truncate text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">
              {chapter.title}
            </h3>
            {features.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {features.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full"
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {done && <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />}
        </div>
      </div>
    </button>
  );
}
