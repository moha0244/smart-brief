// components/flashcard/FlashcardNavigation.tsx
"use client";

import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Button } from "@/components/ui/Button";

interface FlashcardNavigationProps {
  currentIndex: number;
  totalCards: number;
  onPrevious: () => void;
  onNext: () => void;
  progress: number;
}

export function FlashcardNavigation({
  currentIndex,
  totalCards,
  onPrevious,
  onNext,
  progress,
}: FlashcardNavigationProps) {
  return (
    <>
      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          onClick={onPrevious}
          disabled={currentIndex === 0}
          variant="secondary"
          icon={<FiChevronLeft className="w-5 h-5" />}
          iconPosition="left"
        >
          Précédent
        </Button>

        <div className="flex gap-1">
          {Array.from({ length: totalCards }).map((_, index) => (
            <motion.button
              key={index}
              onClick={() => {
                // Navigation directe à implémenter
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-indigo-600 w-4"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
            />
          ))}
        </div>

        <Button
          onClick={onNext}
          disabled={currentIndex === totalCards - 1}
          variant="secondary"
          icon={<FiChevronRight className="w-5 h-5" />}
          iconPosition="right"
        >
          Suivant
        </Button>
      </div>

      {/* Statistics */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          {Math.round(progress)}% complété
        </p>
      </div>
    </>
  );
}
