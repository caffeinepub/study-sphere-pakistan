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
      300,
    );
  };

  const goPrev = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((i) => Math.max(i - 1, 0)), 300);
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
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-600 dark:text-gray-200">
        <span>
          Card {currentIndex + 1} of {cards.length} &bull; Tap card to flip
        </span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 dark:text-gray-300">
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

      {/* Card — perspective wrapper is a plain div; inner button handles interaction */}
      <div
        className="w-full max-w-2xl"
        style={{ perspective: "1200px", height: "280px" }}
      >
        <button
          type="button"
          className="w-full h-full cursor-pointer"
          style={{
            background: "none",
            border: "none",
            padding: 0,
          }}
          onClick={() => setIsFlipped((f) => !f)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-label={isFlipped ? "Show question" : "Reveal answer"}
          data-ocid="flashcard.card"
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              transformStyle: "preserve-3d",
              transition: "transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front face */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                borderRadius: "16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
                backgroundColor: "var(--flashcard-front-bg)",
                color: "var(--flashcard-front-text)",
                boxShadow:
                  "0 10px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)",
              }}
            >
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: "1rem",
                  opacity: 0.85,
                  color: "var(--flashcard-front-text)",
                }}
              >
                Question
              </span>
              <p
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  textAlign: "center",
                  lineHeight: 1.55,
                  color: "var(--flashcard-front-text)",
                }}
              >
                {card.front}
              </p>
              <span
                style={{
                  fontSize: "0.72rem",
                  marginTop: "1rem",
                  opacity: 0.6,
                  color: "var(--flashcard-front-text)",
                }}
              >
                Tap to reveal answer
              </span>
            </div>

            {/* Back face */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                borderRadius: "16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
                backgroundColor: "var(--flashcard-back-bg)",
                color: "var(--flashcard-back-text)",
                boxShadow:
                  "0 10px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)",
              }}
            >
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: "1rem",
                  opacity: 0.85,
                  color: "var(--flashcard-back-text)",
                }}
              >
                Answer
              </span>
              <p
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  textAlign: "center",
                  lineHeight: 1.55,
                  color: "var(--flashcard-back-text)",
                }}
              >
                {card.back}
              </p>
              <span
                style={{
                  fontSize: "0.72rem",
                  marginTop: "1rem",
                  opacity: 0.6,
                  color: "var(--flashcard-back-text)",
                }}
              >
                Tap to see question
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="dark:border-gray-500 dark:text-gray-100 dark:hover:bg-gray-600"
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
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
                setCurrentIndex(i);
              }}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === currentIndex
                  ? "bg-primary dark:bg-blue-400 w-5"
                  : "bg-gray-300 dark:bg-gray-500 w-1.5"
              }`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={goNext}
          disabled={currentIndex === cards.length - 1}
          className="dark:border-gray-500 dark:text-gray-100 dark:hover:bg-gray-600"
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
        className="gap-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Restart
      </Button>
    </div>
  );
}
