import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onComplete, 500);
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-gray-900 transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative flex items-center justify-center mb-8">
        {/* Pulse rings */}
        <div className="absolute w-28 h-28 rounded-full border-2 border-primary dark:border-blue-400 opacity-20 animate-ping" />
        <div className="absolute w-24 h-24 rounded-full border-2 border-primary dark:border-blue-400 opacity-30 animate-ping" style={{ animationDelay: '0.3s' }} />

        {/* Logo */}
        <div className="relative w-20 h-20 rounded-2xl bg-primary dark:bg-blue-600 flex items-center justify-center shadow-xl">
          <BookOpen className="w-10 h-10 text-white" />
        </div>
      </div>

      <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-2">
        StudyHub
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Your study companion</p>

      {/* Loading dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary dark:bg-blue-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
