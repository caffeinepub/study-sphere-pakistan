import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Layers, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import type { FlashcardItem } from "../types/chapter";

interface FlashcardSectionProps {
  cards?: FlashcardItem[];
}

export default function FlashcardSection({ cards }: FlashcardSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [jumpValue, setJumpValue] = useState("");
  const touchStartX = useRef<number | null>(null);

  const handleJump = () => {
    if (!cards) return;
    const num = Number.parseInt(jumpValue, 10);
    if (Number.isNaN(num) || num < 1 || num > cards.length) return;
    setIsFlipped(false);
    setCurrentIndex(num - 1);
    setJumpValue("");
  };

  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Layers className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-heading font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No Flashcards Yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          Flashcards for this chapter haven't been added yet. Check back later!
        </p>
      </div>
    );
  }

  const card = cards[currentIndex];

  const goNext = () => {
    setIsFlipped(false);
    setTimeout(
      () => setCurrentIndex((i) => Math.min(i + 1, cards.length - 1)),
      150,
    );
  };

  const goPrev = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((i) => Math.max(i - 1, 0)), 150);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Counter + Jump */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500 dark:text-gray-400">
        <span>
          Card {currentIndex + 1} of {cards.length} &bull; Tap card to flip
        </span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Jump:
          </span>
          <Input
            type="number"
            min={1}
            max={cards.length}
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJump()}
            placeholder={`1–${cards.length}`}
            className="w-16 h-7 text-xs px-2 py-1"
            data-ocid="flashcard.input"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleJump}
            className="h-7 px-2 text-xs"
            data-ocid="flashcard.button"
          >
            Go
          </Button>
        </div>
      </div>

      {/* Card */}
      <button
        type="button"
        className="flashcard-container w-full max-w-2xl cursor-pointer text-left"
        style={{ height: "280px" }}
        onClick={() => setIsFlipped(!isFlipped)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label={isFlipped ? "Show question" : "Reveal answer"}
      >
        <div className={`flashcard-inner ${isFlipped ? "flipped" : ""}`}>
          {/* Front */}
          <div className="flashcard-face flashcard-front shadow-lg">
            <span
              className="text-xs font-semibold uppercase tracking-widest mb-4 opacity-80"
              style={{ color: "var(--flashcard-front-text)" }}
            >
              Question
            </span>
            <p
              className="text-xl font-heading font-semibold text-center leading-relaxed"
              style={{ color: "var(--flashcard-front-text)" }}
            >
              {card.front}
            </p>
            <span
              className="text-xs mt-4 opacity-60"
              style={{ color: "var(--flashcard-front-text)" }}
            >
              Tap to reveal answer
            </span>
          </div>

          {/* Back */}
          <div className="flashcard-face flashcard-back shadow-lg">
            <span
              className="text-xs font-semibold uppercase tracking-widest mb-4 opacity-80"
              style={{ color: "var(--flashcard-back-text)" }}
            >
              Answer
            </span>
            <p
              className="text-xl font-heading font-semibold text-center leading-relaxed"
              style={{ color: "var(--flashcard-back-text)" }}
            >
              {card.back}
            </p>
            <span
              className="text-xs mt-4 opacity-60"
              style={{ color: "var(--flashcard-back-text)" }}
            >
              Tap to see question
            </span>
          </div>
        </div>
      </button>

      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        {/* Dots */}
        <div className="flex gap-1.5">
          {cards.map((_, i) => (
            <button
              // biome-ignore lint/suspicious/noArrayIndexKey: dot indicators are positional
              key={i}
              type="button"
              onClick={() => {
                setIsFlipped(false);
                setCurrentIndex(i);
              }}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === currentIndex
                  ? "bg-primary dark:bg-blue-400 w-5"
                  : "bg-gray-300 dark:bg-gray-600 w-1.5"
              }`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={goNext}
          disabled={currentIndex === cards.length - 1}
          className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setCurrentIndex(0);
          setIsFlipped(false);
        }}
        className="gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Restart
      </Button>
    </div>
  );
}
