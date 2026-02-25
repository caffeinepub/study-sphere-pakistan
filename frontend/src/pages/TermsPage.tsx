import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Shield } from 'lucide-react';

export default function TermsPage() {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Educational Use Only',
      content:
        'All content on StudyHub is provided strictly for educational purposes. The materials, notes, quizzes, and flashcards are intended to assist students in their studies and exam preparation.',
    },
    {
      title: 'No Board Affiliation',
      content:
        'StudyHub is an independent educational platform and is not affiliated with, endorsed by, or connected to any educational board, government body, or official examination authority in Pakistan.',
    },
    {
      title: 'Content Changes',
      content:
        'We reserve the right to modify, update, or remove any content at any time without prior notice. While we strive to keep content accurate and up-to-date, we cannot guarantee the completeness or accuracy of all materials.',
    },
    {
      title: 'External Links',
      content:
        'StudyHub may contain links to external resources such as Google Drive documents and other third-party content. We are not responsible for the availability, accuracy, or content of these external resources.',
    },
    {
      title: 'Copyright',
      content:
        'All original content created by StudyHub is protected by copyright. Users may use the content for personal educational purposes only. Redistribution, commercial use, or reproduction without permission is prohibited.',
    },
  ];

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-blue-900/30 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">
              Terms &amp; Conditions
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Last updated: {new Date().getFullYear()}</p>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          By using StudyHub, you agree to the following terms and conditions. Please read them carefully.
        </p>

        {/* Sections */}
        <div className="flex flex-col gap-6">
          {sections.map((section, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
            >
              <h2 className="font-heading font-semibold text-lg text-gray-900 dark:text-white mb-3">
                {i + 1}. {section.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            If you have any questions about these terms, please contact us through the{' '}
            <button
              onClick={() => navigate({ to: '/support' })}
              className="text-primary dark:text-blue-400 hover:underline"
            >
              Support page
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
