import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  RotateCcw,
  SkipForward,
  ToggleLeft,
  Trophy,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import type { TrueFalseQuestion } from "../types/chapter";

interface TrueFalseSectionProps {
  questions?: TrueFalseQuestion[];
}

export default function TrueFalseSection({ questions }: TrueFalseSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  // answers[i] = boolean chosen, or null if skipped
  const [answers, setAnswers] = useState<(boolean | null)[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [jumpValue, setJumpValue] = useState("");

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <ToggleLeft className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No True/False Questions
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          True/False questions haven't been added for this chapter yet.
        </p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isAnswered = selectedAnswer !== null;

  const handleAnswer = (value: boolean) => {
    if (isAnswered) return;
    setSelectedAnswer(value);
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
      (a, i) => a !== null && a === questions[i]?.answer,
    ).length;
    const totalWrong = totalAnswered - totalCorrect;
    const percentage =
      totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    return (
      <div
        className="max-w-lg mx-auto text-center py-8"
        data-ocid="truefalse.panel"
      >
        <div className="w-24 h-24 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-12 h-12 text-yellow-500 dark:text-yellow-400" />
        </div>
        <h2 className="font-bold text-2xl text-gray-900 dark:text-white mb-2">
          True/False Complete!
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Here's how you did
        </p>

        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
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
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-4">
              <div
                className="h-3 rounded-full bg-primary dark:bg-blue-500 transition-all duration-500"
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
          data-ocid="truefalse.button"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    );
  }

  const isCorrectAnswer = currentQuestion.answer;

  return (
    <div
      className="max-w-2xl mx-auto flex flex-col gap-5 py-4"
      data-ocid="truefalse.panel"
    >
      {/* Progress + Jump */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400 dark:text-gray-500">
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
                data-ocid="truefalse.input"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleJump}
                className="h-7 px-2 text-xs"
                data-ocid="truefalse.button"
              >
                Go
              </Button>
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-primary dark:bg-blue-500 transition-all duration-300"
            style={{ width: `${(currentIndex / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Statement card */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Statement
        </p>
        <p className="font-semibold text-lg text-gray-900 dark:text-white leading-relaxed">
          {currentQuestion.statement}
        </p>
      </div>

      {/* True / False buttons */}
      <div className="grid grid-cols-2 gap-4">
        {/* True button */}
        {(() => {
          const isSelected = selectedAnswer === true;
          const isCorrect = isCorrectAnswer === true;
          let cls =
            "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 py-6 font-bold text-lg transition-all duration-200 ";
          if (!isAnswered) {
            cls +=
              "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:border-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/40 cursor-pointer";
          } else if (isCorrect && isSelected) {
            cls +=
              "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 shadow-[0_0_16px_rgba(34,197,94,0.45)]";
          } else if (!isCorrect && isSelected) {
            cls +=
              "border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300";
          } else if (isCorrect && !isSelected) {
            cls +=
              "border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 shadow-[0_0_12px_rgba(34,197,94,0.3)]";
          } else {
            cls +=
              "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 opacity-50";
          }
          return (
            <button
              type="button"
              className={cls}
              onClick={() => handleAnswer(true)}
              disabled={isAnswered}
              data-ocid="truefalse.button"
            >
              {isAnswered && isCorrect && <CheckCircle className="w-6 h-6" />}
              {isAnswered && isSelected && !isCorrect && (
                <XCircle className="w-6 h-6" />
              )}
              ✓ True
            </button>
          );
        })()}

        {/* False button */}
        {(() => {
          const isSelected = selectedAnswer === false;
          const isCorrect = isCorrectAnswer === false;
          let cls =
            "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 py-6 font-bold text-lg transition-all duration-200 ";
          if (!isAnswered) {
            cls +=
              "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer";
          } else if (isCorrect && isSelected) {
            cls +=
              "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 shadow-[0_0_16px_rgba(34,197,94,0.45)]";
          } else if (!isCorrect && isSelected) {
            cls +=
              "border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300";
          } else if (isCorrect && !isSelected) {
            cls +=
              "border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 shadow-[0_0_12px_rgba(34,197,94,0.3)]";
          } else {
            cls +=
              "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 opacity-50";
          }
          return (
            <button
              type="button"
              className={cls}
              onClick={() => handleAnswer(false)}
              disabled={isAnswered}
              data-ocid="truefalse.button"
            >
              {isAnswered && isCorrect && <CheckCircle className="w-6 h-6" />}
              {isAnswered && isSelected && !isCorrect && (
                <XCircle className="w-6 h-6" />
              )}
              ✗ False
            </button>
          );
        })()}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between gap-3">
        {!isAnswered && (
          <Button
            variant="outline"
            onClick={handleSkip}
            className="gap-2 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600"
            data-ocid="truefalse.button"
          >
            <SkipForward className="w-4 h-4" />
            Skip
          </Button>
        )}
        {isAnswered && (
          <Button
            onClick={handleNext}
            className="ml-auto"
            data-ocid="truefalse.button"
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
