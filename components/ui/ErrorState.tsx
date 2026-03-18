// components/ui/ErrorState.tsx
"use client";

import { motion } from "framer-motion";
import { FiAlertCircle } from "react-icons/fi";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}

export function ErrorState({ 
  message, 
  onRetry, 
  retryText = "Réessayer",
  className = ""
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white rounded-2xl p-8 shadow-sm border border-gray-100 ${className}`}
    >
      <div className="text-center py-8">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, -5, 5, 0],
          }}
          transition={{ duration: 0.5 }}
          className="inline-block p-4 bg-red-50 rounded-full mb-4"
        >
          <FiAlertCircle className="w-8 h-8 text-red-400" />
        </motion.div>
        <p className="text-red-600 font-medium mb-4">{message}</p>
        {onRetry && (
          <motion.button
            onClick={onRetry}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            {retryText}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
