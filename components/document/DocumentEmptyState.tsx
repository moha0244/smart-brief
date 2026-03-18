// components/document/DocumentEmptyState.tsx
"use client";

import { motion } from "framer-motion";
import { FiFileText } from "react-icons/fi";

interface DocumentEmptyStateProps {
  searchQuery?: string;
}

export function DocumentEmptyState({ searchQuery }: DocumentEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 bg-gray-50 rounded-2xl"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="w-20 h-20 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4"
      >
        <FiFileText className="w-10 h-10 text-gray-400" />
      </motion.div>
      
      <h3 className="text-lg font-medium text-gray-600 mb-2">
        {searchQuery ? "Aucun document trouvé" : "Aucun document pour cette session"}
      </h3>
      
      <p className="text-gray-400 text-sm max-w-md mx-auto">
        {searchQuery 
          ? `Aucun document ne correspond à votre recherche "${searchQuery}"`
          : "Importez votre premier document pour commencer à l'analyser"
        }
      </p>
    </motion.div>
  );
}
