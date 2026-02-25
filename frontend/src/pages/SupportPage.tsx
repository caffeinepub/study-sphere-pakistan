import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Heart, Copy, Check, Smartphone } from 'lucide-react';

const EASYPAISA_NUMBER = '03320335528';

export default function SupportPage() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(EASYPAISA_NUMBER).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-red-500 dark:text-red-400 fill-current" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-3">
            Support Us
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            StudyHub is completely free for all students. If you find it helpful, consider supporting us to keep it running and improving.
          </p>
        </div>

        {/* Easypaisa Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-gray-900 dark:text-white">Easypaisa</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Send any amount you can</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Account Number</p>
              <p className="text-2xl font-heading font-bold text-gray-900 dark:text-white tracking-wider">
                {EASYPAISA_NUMBER}
              </p>
            </div>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                copied
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-primary dark:bg-blue-600 text-white hover:bg-primary/90 dark:hover:bg-blue-700'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Any amount is appreciated — even Rs. 50 helps! 🙏
          </p>
        </div>

        {/* Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="font-heading font-semibold text-gray-900 dark:text-white mb-4">How to Send</h3>
          <ol className="flex flex-col gap-3">
            {[
              'Open your Easypaisa app or dial *786#',
              'Select "Send Money"',
              `Enter the number: ${EASYPAISA_NUMBER}`,
              'Enter the amount you wish to send',
              'Confirm the transaction',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 dark:bg-blue-900/30 text-primary dark:text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-gray-600 dark:text-gray-400 text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-8">
          Thank you for your support! It means the world to us. ❤️
        </p>
      </div>
    </div>
  );
}
