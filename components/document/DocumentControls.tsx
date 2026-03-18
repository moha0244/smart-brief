// components/document/DocumentControls.tsx
"use client";

import { motion } from "framer-motion";
import { FiGrid, FiList, FiTrash2 } from "react-icons/fi";

interface DocumentControlsProps {
  documentsCount: number;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onDeleteAll: () => void;
  isDeletingAll: boolean;
}

export function DocumentControls({
  documentsCount,
  viewMode,
  onViewModeChange,
  onDeleteAll,
  isDeletingAll
}: DocumentControlsProps) {
  return (
    <div className="flex items-center gap-2">
      {documentsCount > 0 && (
        <motion.button
          onClick={onDeleteAll}
          disabled={isDeletingAll}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          whileHover={!isDeletingAll ? { scale: 1.02 } : {}}
          whileTap={!isDeletingAll ? { scale: 0.98 } : {}}
        >
          {isDeletingAll ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full"
              />
              Suppression...
            </>
          ) : (
            <>
              <FiTrash2 className="w-4 h-4" />
              Tout supprimer
            </>
          )}
        </motion.button>
      )}
      
      <motion.button
        onClick={() => onViewModeChange("list")}
        className={`p-2 rounded-lg transition-colors ${
          viewMode === "list"
            ? "bg-indigo-100 text-indigo-600"
            : "text-gray-400 hover:text-gray-600"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiList className="w-5 h-5" />
      </motion.button>
      
      <motion.button
        onClick={() => onViewModeChange("grid")}
        className={`p-2 rounded-lg transition-colors ${
          viewMode === "grid"
            ? "bg-indigo-100 text-indigo-600"
            : "text-gray-400 hover:text-gray-600"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiGrid className="w-5 h-5" />
      </motion.button>
    </div>
  );
}
