// components/document/DocumentHeader.tsx
"use client";

import { motion } from "framer-motion";

interface DocumentHeaderProps {
  sessionToken: string;
}

export function DocumentHeader({ sessionToken }: DocumentHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg mb-6"
    >
      <div className="flex items-center justify-between">
        <span>
          Session ID: <span className="font-mono">{sessionToken}</span>
        </span>
        <span className="text-gray-300">
          ID de session pour le débogage
        </span>
      </div>
    </motion.div>
  );
}
