import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  SkipForward,
  Trophy,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import type { QuizQuestion } from "../types/chapter";

interface QuizSectionProps {
  questions?: QuizQuestion[];
}

export default function QuizSection({ questions }: QuizSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  // answers[i] = option index chosen, or null if skipped
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResult, setShowResult] = useState(false);

  // Jump-to state
  const [jumpValue, setJumpValue] = useState("");

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

  // Count answered so far (not including current unanswered)
  const answeredSoFar = answers.filter((a) => a !== null).length;

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

  const handleSkip = () => {
    const newAnswers = [...answers, null];
    setAnswers(newAnswers);
    if (currentIndex + 1 >= questions.length) {
      setShowResult(true);
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
    }
  };

  const handleJump = () => {
    const num = Number.parseInt(jumpValue, 10);
    if (Number.isNaN(num) || num < 1 || num > questions.length) return;
    setCurrentIndex(num - 1);
    setSelectedAnswer(null);
    setJumpValue("");
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowResult(false);
    setJumpValue("");
  };

  if (showResult) {
    const totalSkipped = answers.filter((a) => a === null).length;
    const totalAnswered = answers.length - totalSkipped;
    const totalCorrect = answers.filter(
      (a, i) => a !== null && a === questions[i]?.correctAnswer,
    ).length;
    const totalWrong = totalAnswered - totalCorrect;
    const percentage =
      totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    return (
      <div className="max-w-lg mx-auto text-center py-8" data-ocid="quiz.panel">
        <div className="w-24 h-24 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-12 h-12 text-yellow-500 dark:text-yellow-400" />
        </div>
        <h2 className="font-bold text-2xl text-gray-900 dark:text-white mb-2">
          Quiz Complete!
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Here's how you did
        </p>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 mb-6">
          <div className="text-5xl font-bold text-primary dark:text-blue-400 mb-2">
            {totalAnswered > 0 ? `${percentage}%` : "—"}
          </div>
          {totalAnswered === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              All questions were skipped
            </p>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Based on {totalAnswered} answered question
              {totalAnswered !== 1 ? "s" : ""}
            </p>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {totalCorrect}
              </div>
              <div className="text-xs text-green-700 dark:text-green-300 font-medium mt-0.5">
                Correct
              </div>
            </div>
            <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {totalWrong}
              </div>
              <div className="text-xs text-red-700 dark:text-red-300 font-medium mt-0.5">
                Wrong
              </div>
            </div>
            <div className="rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {totalSkipped}
              </div>
              <div className="text-xs text-yellow-700 dark:text-yellow-300 font-medium mt-0.5">
                Skipped
              </div>
            </div>
          </div>

          {totalAnswered > 0 && (
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mt-4">
              <div
                className="h-3 rounded-full bg-primary dark:bg-blue-400 transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          )}
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {totalAnswered === 0
            ? "No questions were answered."
            : percentage >= 80
              ? "🎉 Excellent work! Keep it up!"
              : percentage >= 60
                ? "👍 Good job! Review the missed questions."
                : "📚 Keep studying! You can do better next time."}
        </p>

        <Button
          onClick={handleRestart}
          className="gap-2 px-8"
          data-ocid="quiz.button"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div
      className="max-w-2xl mx-auto flex flex-col gap-5 py-4"
      data-ocid="quiz.panel"
    >
      {/* Progress + Jump */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600 dark:text-gray-300 mb-2">
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs">
              Score:{" "}
              {answeredSoFar > 0
                ? `${answers.filter((a, i) => a !== null && a === questions[i]?.correctAnswer).length}/${answeredSoFar}`
                : "—"}
            </span>
            {/* Jump control */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Jump:
              </span>
              <Input
                type="number"
                min={1}
                max={questions.length}
                value={jumpValue}
                onChange={(e) => setJumpValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJump()}
                placeholder={`1–${questions.length}`}
                className="w-16 h-7 text-xs px-2 py-1"
                data-ocid="quiz.input"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleJump}
                className="h-7 px-2 text-xs"
                data-ocid="quiz.button"
              >
                Go
              </Button>
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-primary dark:bg-blue-400 transition-all duration-300"
            style={{ width: `${(currentIndex / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-600">
        <p className="font-semibold text-lg text-gray-900 dark:text-white leading-relaxed">
          {currentQuestion.question}
        </p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {currentQuestion.options.map((option, idx) => {
          if (!option) return null;
          const isCorrect = idx === currentQuestion.correctAnswer;
          const isSelected = idx === selectedAnswer;

          let optionClass =
            "w-full text-left px-5 py-4 rounded-xl border-2 font-medium transition-all duration-200 flex items-center gap-3 ";

          if (!isAnswered) {
            optionClass +=
              "border-gray-200 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:border-primary dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer";
          } else if (isCorrect) {
            optionClass +=
              "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 shadow-[0_0_12px_rgba(34,197,94,0.4)]";
          } else if (isSelected && !isCorrect) {
            optionClass +=
              "border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200";
          } else {
            optionClass +=
              "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-400 dark:text-gray-400 opacity-60";
          }

          return (
            <button
              // biome-ignore lint/suspicious/noArrayIndexKey: options are positional (A/B/C/D)
              key={idx}
              type="button"
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

      {/* Explanation box — shown after answering */}
      {isAnswered && currentQuestion.explanation && (
        <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 flex gap-3 animate-in fade-in duration-300">
          <Lightbulb className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
            {currentQuestion.explanation}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between gap-3">
        {!isAnswered && (
          <Button
            variant="outline"
            onClick={handleSkip}
            className="gap-2 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600"
            data-ocid="quiz.button"
          >
            <SkipForward className="w-4 h-4" />
            Skip
          </Button>
        )}
        {isAnswered && (
          <Button
            onClick={handleNext}
            className="ml-auto"
            data-ocid="quiz.button"
          >
            {currentIndex + 1 >= questions.length
              ? "See Results"
              : "Next Question"}
          </Button>
        )}
      </div>
    </div>
  );
}
