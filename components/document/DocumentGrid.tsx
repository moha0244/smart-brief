// components/document/DocumentGrid.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DocumentCard } from "../DocumentCard";
import { Document } from "@/lib/types/common";

interface DocumentGridProps {
  documents: Document[];
  viewMode: "grid" | "list";
  onDelete: () => void;
  onDeleteClick: (id: string, title: string, pages: number, date: string) => void;
}

export function DocumentGrid({ 
  documents, 
  viewMode, 
  onDelete, 
  onDeleteClick 
}: DocumentGridProps) {
  if (documents.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 bg-gray-50 rounded-2xl"
      >
        <p className="text-gray-400">Aucun document trouvé</p>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="popLayout">
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch"
            : "space-y-3"
        }
      >
        {documents.map((doc) => (
          <motion.div
            key={doc.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <DocumentCard
              id={doc.id}
              uuid={doc.uuid}
              title={doc.title}
              date={doc.created_at}
              pages={doc.pages}
              status={doc.status}
              onDelete={onDelete}
              onDeleteClick={onDeleteClick}
            />
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
}
