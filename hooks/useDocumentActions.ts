// hooks/useDocumentActions.ts
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface DocumentToDelete {
  id: string;
  title: string;
  pages: number;
  date: string;
}

export function useDocumentActions(sessionToken: string, onRefresh: () => void) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<DocumentToDelete | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const handleDeleteClick = (id: string, title: string, pages: number, date: string) => {
    setDocumentToDelete({ id, title, pages, date });
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!documentToDelete) return;

    try {
      const { data: doc } = await supabase
        .from("documents")
        .select("file_path")
        .eq("id", documentToDelete.id)
        .single();

      if (doc?.file_path) {
        await supabase.storage.from("documents").remove([doc.file_path]);
      }

      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", documentToDelete.id);

      if (error) throw error;

      onRefresh();
      setShowDeleteConfirm(false);
      setDocumentToDelete(null);
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  const handleDeleteAllDocuments = async () => {
    setIsDeletingAll(true);
    try {
      const { data: documents } = await supabase
        .from("documents")
        .select("file_path")
        .eq("session_token", sessionToken);

      if (documents && documents.length > 0) {
        const filePaths = documents.map(doc => doc.file_path).filter(Boolean);
        if (filePaths.length > 0) {
          await supabase.storage.from("documents").remove(filePaths);
        }
      }

      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("session_token", sessionToken);

      if (error) throw error;

      onRefresh();
      setShowDeleteAllConfirm(false);
    } catch (error) {
      console.error("Erreur suppression tous les documents:", error);
    } finally {
      setIsDeletingAll(false);
    }
  };

  return {
    showDeleteConfirm,
    documentToDelete,
    showDeleteAllConfirm,
    isDeletingAll,
    handleDeleteClick,
    handleConfirmDelete,
    handleDeleteAllDocuments,
    setShowDeleteConfirm,
    setShowDeleteAllConfirm,
    setDocumentToDelete,
  };
}
