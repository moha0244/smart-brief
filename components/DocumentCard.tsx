import { StatusIndicator } from "@/components/ui/StatusIndicator";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  FiFileText,
  FiCalendar,
  FiBook,
  FiTrash2,
  FiArrowRight,
} from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "./ConfirmDialog";

import { DocumentCardProps } from "@/lib/types/components";

export function DocumentCard({
  id,
  uuid,
  title,
  date,
  pages,
  status,
  onDelete,
  onDeleteClick,
  isProcessing = false,
}: DocumentCardProps & { isProcessing?: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const router = useRouter();

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const { data: doc } = await supabase
        .from("documents")
        .select("file_path")
        .eq("id", id)
        .single();

      if (doc?.file_path) {
        await supabase.storage.from("documents").remove([doc.file_path]);
      }

      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (error) throw error;

      if (onDelete) onDelete();
      else router.refresh();

      setShowConfirm(false);
    } catch (error) {
      console.error("Erreur suppression:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
      className="relative group"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link
        href={status === "en cours" ? "#" : `/documents/${uuid}`}
        className={status === "en cours" ? "cursor-not-allowed" : ""}
        onClick={(e) => {
          if (status === "en cours") {
            e.preventDefault();

            alert(
              "Ce document est en cours de traitement. Veuillez patienter.",
            );
          }
        }}
      >
        {" "}
        <motion.div
          className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden"
          animate={{
            borderColor: isHovered ? "#6366f1" : "#f3f4f6",
          }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <motion.div
                animate={{
                  rotate: isHovered ? [0, -10, 10, -5, 0] : 0,
                  scale: isHovered ? 1.1 : 1,
                }}
                transition={{ duration: 0.4 }}
                className={`p-4 rounded-2xl ${status === "traite" ? "bg-emerald-50" : status === "en cours" ? "bg-orange-50" : "bg-red-50"}`}
              >
                <FiFileText
                  className={`w-6 h-6 ${status === "traite" ? "text-emerald-500" : status === "en cours" ? "text-orange-500" : "text-red-500"}`}
                />
              </motion.div>

              <div className="flex-1">
                <motion.h3
                  className={`font-bold text-gray-900 text-lg mb-2 line-clamp-2`}
                  animate={{
                    x: isHovered ? 5 : 0,
                    color: isHovered ? "#4f46e5" : "#111827",
                  }}
                  title={title}
                >
                  {title.length > 40 ? title.substring(0, 40) + "..." : title}
                </motion.h3>

                <div className="flex items-center gap-3 text-sm">
                  <motion.div
                    className="flex items-center gap-1.5 text-gray-500"
                    animate={{ scale: isHovered ? 1.05 : 1 }}
                  >
                    <FiCalendar className="w-4 h-4" />
                    {new Date(date).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </motion.div>

                  <span className="w-1 h-1 bg-gray-300 rounded-full" />

                  <motion.div
                    className="flex items-center gap-1.5 text-gray-500"
                    animate={{ scale: isHovered ? 1.05 : 1 }}
                  >
                    <FiBook className="w-4 h-4" />
                    <span>
                      {pages} {pages > 1 ? "pages" : "page"}
                    </span>
                  </motion.div>
                </div>
              </div>
            </div>

            <StatusIndicator status={status} size="md" />

            <motion.div
              className="ml-4 text-indigo-600"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
            >
              <FiArrowRight className="w-5 h-5" />
            </motion.div>
          </div>

          {status === "en cours" && (
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}

          {isProcessing && (
            <motion.div
              className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex flex-col items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full"
                />
                <span className="text-sm font-medium text-indigo-600">
                  Traitement en cours...
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </Link>

      <motion.button
        onClick={() => onDeleteClick?.(id, title, pages, date)}
        disabled={isDeleting || isProcessing}
        className="absolute -top-2 -right-2 w-10 h-10 bg-red-500 text-white rounded-full shadow-lg flex items-center justify-center z-10"
        initial={{ scale: 0, rotate: -90 }}
        animate={{
          scale: isHovered && !isProcessing ? 1 : 0,
          rotate: isHovered && !isProcessing ? 0 : -90,
        }}
        whileHover={!isProcessing ? { scale: 1.1 } : {}}
        whileTap={!isProcessing ? { scale: 0.9 } : {}}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {isDeleting ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
          />
        ) : (
          <FiTrash2 className="w-5 h-5" />
        )}
      </motion.button>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer le document ?"
        message="Cette action est irréversible."
        type="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
        itemDetails={[
          { label: "Titre", value: title },
          { label: "Pages", value: `${pages} pages` },
          {
            label: "Date",
            value: new Date(date).toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
          },
        ]}
      />
    </motion.div>
  );
}
