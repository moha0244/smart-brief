// components/flashcard/FlashcardDisplay.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiHelpCircle, FiCheckCircle } from "react-icons/fi";
import { Card } from "@/components/ui/Card";
import { FlashcardDisplayProps, Flashcard } from "@/lib/types";

export function FlashcardDisplay({ flashcard, showAnswer, onToggle }: FlashcardDisplayProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={showAnswer ? "answer" : "question"}
        initial={{ opacity: 0, scale: 0.8, rotateY: showAnswer ? 180 : 0 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        onClick={onToggle}
        className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 cursor-pointer border-2 border-gray-100 hover:border-indigo-200 transition-all min-h-[350px] flex items-center justify-center shadow-sm hover:shadow-md"
      >
        {!showAnswer ? (
          <QuestionView flashcard={flashcard} />
        ) : (
          <AnswerView flashcard={flashcard} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function QuestionView({ flashcard }: { flashcard: Flashcard }) {
  return (
    <div className="text-center">
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="inline-block p-3 bg-indigo-100 rounded-full mb-6"
      >
        <FiHelpCircle className="w-6 h-6 text-indigo-600" />
      </motion.div>
      <div className="text-sm text-indigo-600 font-medium mb-3">
        Page {flashcard.page}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        QUESTION
      </h3>
      <p className="text-gray-700 text-lg max-w-md mx-auto">
        {flashcard.question}
      </p>
      <motion.div
        className="mt-8 text-sm text-gray-400"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Cliquez pour voir la réponse
      </motion.div>
    </div>
  );
}

function AnswerView({ flashcard }: { flashcard: Flashcard }) {
  return (
    <div className="text-center">
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="inline-block p-3 bg-emerald-100 rounded-full mb-6"
      >
        <FiCheckCircle className="w-6 h-6 text-emerald-600" />
      </motion.div>
      <div className="text-sm text-emerald-600 font-medium mb-3">
        RÉPONSE
      </div>
      <p className="text-gray-700 text-lg leading-relaxed max-w-md mx-auto">
        {flashcard.answer}
      </p>
    </div>
  );
}
