import { useState } from 'react';
import type { QuizQuestion } from '../types/chapter';
import { CheckCircle, XCircle, Trophy, RotateCcw, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuizSectionProps {
  questions?: QuizQuestion[];
}

export default function QuizSection({ questions }: QuizSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResult, setShowResult] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <HelpCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No Quiz Available
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Quiz questions haven't been added for this chapter yet.
        </p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isAnswered = selectedAnswer !== null;
  // correctAnswer is a number (index into options array)
  const score = answers.filter((a, i) => a === questions[i]?.correctAnswer).length;

  const handleAnswer = (idx: number) => {
    if (isAnswered) return;
    setSelectedAnswer(idx);
  };

  const handleNext = () => {
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    if (currentIndex + 1 >= questions.length) {
      setShowResult(true);
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowResult(false);
  };

  if (showResult) {
    const finalScore = answers.filter((a, i) => a === questions[i]?.correctAnswer).length;
    const percentage = Math.round((finalScore / questions.length) * 100);
    return (
      <div className="max-w-lg mx-auto text-center py-8">
        <div className="w-24 h-24 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-12 h-12 text-yellow-500 dark:text-yellow-400" />
        </div>
        <h2 className="font-bold text-2xl text-gray-900 dark:text-white mb-2">
          Quiz Complete!
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Here's how you did</p>

        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="text-5xl font-bold text-primary dark:text-blue-400 mb-2">
            {percentage}%
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            {finalScore} out of {questions.length} correct
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-primary dark:bg-blue-500 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {percentage >= 80
            ? '🎉 Excellent work! Keep it up!'
            : percentage >= 60
            ? '👍 Good job! Review the missed questions.'
            : '📚 Keep studying! You can do better next time.'}
        </p>

        <Button onClick={handleRestart} className="gap-2 px-8">
          <RotateCcw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 py-4">
      {/* Progress */}
      <div>
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>Score: {score}/{currentIndex}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-primary dark:bg-blue-500 transition-all duration-300"
            style={{ width: `${(currentIndex / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <p className="font-semibold text-lg text-gray-900 dark:text-white leading-relaxed">
          {currentQuestion.question}
        </p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {currentQuestion.options.map((option, idx) => {
          const isCorrect = idx === currentQuestion.correctAnswer;
          const isSelected = idx === selectedAnswer;

          let optionClass =
            'w-full text-left px-5 py-4 rounded-xl border-2 font-medium transition-all duration-200 flex items-center gap-3 ';

          if (!isAnswered) {
            optionClass +=
              'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:border-primary dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer';
          } else if (isCorrect) {
            optionClass +=
              'border-green-500 dark:border-green-500 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200';
          } else if (isSelected && !isCorrect) {
            optionClass +=
              'border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200';
          } else {
            optionClass +=
              'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 opacity-60';
          }

          return (
            <button
              key={idx}
              className={optionClass}
              onClick={() => handleAnswer(idx)}
              disabled={isAnswered}
            >
              <span className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold flex-shrink-0">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1">{option}</span>
              {isAnswered && isCorrect && (
                <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
              )}
              {isAnswered && isSelected && !isCorrect && (
                <XCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Next button */}
      {isAnswered && (
        <div className="flex justify-end">
          <Button onClick={handleNext}>
            {currentIndex + 1 >= questions.length ? 'See Results' : 'Next Question'}
          </Button>
        </div>
      )}
    </div>
  );
}
