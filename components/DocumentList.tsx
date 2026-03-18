// components/DocumentList.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LoadingState } from "@/components/ui/LoadingSpinner";
import { ConfirmDialog } from "./ConfirmDialog";
import { DocumentFilters } from "./document/DocumentFilters";
import { DocumentControls } from "./document/DocumentControls";
import { DocumentGrid } from "./document/DocumentGrid";

import { DocumentEmptyState } from "./document/DocumentEmptyState";
import { useDocuments } from "@/hooks/useDocuments";
import { useDocumentActions } from "@/hooks/useDocumentActions";
import { DocumentListProps } from "@/lib/types/components";

export function DocumentList({
  refreshKey,
  searchQuery,
  onCountChange,
  sessionToken,
}: DocumentListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Hooks pour la logique métier
  const { documents, loading, fetchDocuments } = useDocuments(
    sessionToken,
    filterStatus,
    refreshKey,
  );
  const documentActions = useDocumentActions(sessionToken, fetchDocuments);

  // Filtre les documents selon la recherche
  const filteredDocuments = searchQuery
    ? documents.filter((doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : documents;

  // Met à jour le compteur avec useEffect
  useEffect(() => {
    if (onCountChange) {
      onCountChange(documents.length);
    }
  }, [documents, onCountChange]);

  if (!sessionToken) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Initialisation de la session...</p>
      </div>
    );
  }

  if (loading) {
    return <LoadingState message="Chargement des documents..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
      >
        <DocumentFilters
          documents={documents}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
        />

        <DocumentControls
          documentsCount={documents.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onDeleteAll={() => documentActions.setShowDeleteAllConfirm(true)}
          isDeletingAll={documentActions.isDeletingAll}
        />
      </motion.div>

      {/* Liste des documents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {filteredDocuments.length === 0 ? (
          <DocumentEmptyState searchQuery={searchQuery} />
        ) : (
          <DocumentGrid
            documents={filteredDocuments}
            viewMode={viewMode}
            onDelete={fetchDocuments}
            onDeleteClick={documentActions.handleDeleteClick}
          />
        )}
      </motion.div>

      {/* Dialog de confirmation pour suppression individuelle */}
      <ConfirmDialog
        isOpen={documentActions.showDeleteConfirm}
        onClose={() => {
          documentActions.setShowDeleteConfirm(false);
          documentActions.setDocumentToDelete(null);
        }}
        onConfirm={documentActions.handleConfirmDelete}
        title="Supprimer le document ?"
        message="Cette action est irréversible."
        type="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
        itemDetails={
          documentActions.documentToDelete
            ? [
                {
                  label: "Titre",
                  value: documentActions.documentToDelete.title,
                },
                {
                  label: "Pages",
                  value: `${documentActions.documentToDelete.pages} pages`,
                },
                { label: "Date", value: documentActions.documentToDelete.date },
              ]
            : []
        }
      />

      {/* Dialog de confirmation pour suppression totale */}
      <ConfirmDialog
        isOpen={documentActions.showDeleteAllConfirm}
        onClose={() => documentActions.setShowDeleteAllConfirm(false)}
        onConfirm={documentActions.handleDeleteAllDocuments}
        title="Supprimer tous les documents ?"
        message={`Cette action est irréversible et supprimera ${documents.length} document(s) de cette session.`}
        type="danger"
        confirmText="Tout supprimer"
        cancelText="Annuler"
        itemDetails={[
          {
            label: "Nombre de documents",
            value: `${documents.length} documents`,
          },
          { label: "Session", value: sessionToken?.substring(0, 8) + "..." },
        ]}
      />
    </motion.div>
  );
}
