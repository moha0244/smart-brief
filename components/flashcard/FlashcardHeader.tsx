// components/flashcard/FlashcardHeader.tsx
"use client";

import { motion } from "framer-motion";
import { FiShuffle, FiRefreshCw, FiLayers } from "react-icons/fi";
import { IconButton } from "@/components/ui/Button";
import { ExportMenu } from "@/components/ExportMenu";
import { Flashcard } from "@/lib/types";

interface FlashcardHeaderProps {
  currentIndex: number;
  totalCards: number;
  onShuffle: () => void;
  onRegenerate: () => void;
  documentId: string;
  flashcards: Flashcard[];
}

export function FlashcardHeader({
  currentIndex,
  totalCards,
  onShuffle,
  onRegenerate,
  documentId,
  flashcards,
}: FlashcardHeaderProps) {
  const progress = ((currentIndex + 1) / totalCards) * 100;

  return (
    <>
      {/* Header with progress */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            className="p-2 bg-indigo-50 rounded-lg"
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, -5, 5, 0],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <FiLayers className="w-5 h-5 text-indigo-600" />
          </motion.div>
          <div>
            <span className="text-sm text-gray-500">Carte</span>
            <p className="text-lg font-semibold text-gray-900">
              {currentIndex + 1} / {totalCards}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <IconButton
            icon={<FiShuffle className="w-5 h-5" />}
            onClick={onShuffle}
            tooltip="Mélanger"
          />

          <ExportMenu
            data={{ flashcards }}
            filename={`flashcards-${documentId}`}
            formats={["json", "csv", "txt"]}
            onExport={(format) => console.log(`Exporté en ${format}`)}
          />

          <IconButton
            icon={<FiRefreshCw className="w-5 h-5" />}
            onClick={onRegenerate}
            tooltip="Régénérer"
          />
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100 rounded-full mb-6">
        <motion.div
          className="h-full bg-indigo-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </>
  );
}
