// components/upload/UploadPopup.tsx (déplacé et nettoyé)
"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiFileText,
  FiClock,
  FiFile,
  FiTool,
} from "react-icons/fi";
import { UploadPopupDetails } from "@/lib/types/components";

interface UploadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  type: "success" | "warning" | "error" | "processing";
  title: string;
  message: string;
  details?: UploadPopupDetails;
}

export function UploadPopup({
  isOpen,
  onClose,
  type,
  title,
  message,
  details,
}: UploadPopupProps) {
  const config = {
    success: {
      icon: FiCheckCircle,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      progressColor: "bg-emerald-500",
    },
    warning: {
      icon: FiAlertCircle,
      color: "text-yellow-500",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      progressColor: "bg-yellow-500",
    },
    error: {
      icon: FiAlertCircle,
      color: "text-red-500",
      bg: "bg-red-50",
      border: "border-red-200",
      progressColor: "bg-red-500",
    },
    processing: {
      icon: FiClock,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      progressColor: "bg-indigo-500",
    },
  };

  const { icon: Icon, color, bg, border, progressColor } = config[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={type === "processing" ? undefined : onClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div
              className={`bg-white rounded-2xl shadow-2xl border ${border} overflow-hidden`}
            >
              {/* Barre de progression  */}
              {type === "processing" && (
                <motion.div
                  className={`h-1 ${progressColor}`}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              {/* Contenu */}
              <div className="p-6">
                {/* Bouton fermer */}
                <button
                  onClick={type === "processing" ? undefined : onClose}
                  disabled={type === "processing"}
                  className={`absolute top-4 right-4 transition-colors ${
                    type === "processing"
                      ? "text-gray-200 cursor-not-allowed"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <FiX className="w-5 h-5" />
                </button>

                {/* Icône */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className={`w-20 h-20 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                >
                  <Icon className={`w-10 h-10 ${color}`} />
                </motion.div>

                {/* Titre */}
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                  {title}
                </h3>

                {/* Message */}
                <p className="text-gray-500 text-center mb-6">{message}</p>

                {/* Détails du document */}
                {details && (
                  <div className={`${bg} rounded-xl p-4 mb-6 space-y-2`}>
                    {details.fileName && (
                      <div className="flex items-center gap-2 text-sm">
                        <FiFileText className={`w-4 h-4 ${color}`} />
                        <span className="text-gray-600 truncate flex-1">
                          {details.fileName}
                        </span>
                      </div>
                    )}
                    {details.pages && (
                      <div className="flex items-center gap-2 text-sm">
                        <FiFile className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {details.pages} pages
                        </span>
                      </div>
                    )}
                    {details.extractionMethod && (
                      <div className="flex items-center gap-2 text-sm">
                        <FiTool className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {details.extractionMethod}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Bouton d'action */}
                <motion.button
                  onClick={type === "processing" ? undefined : onClose}
                  disabled={type === "processing"}
                  whileHover={type === "processing" ? {} : { scale: 1.02 }}
                  whileTap={type === "processing" ? {} : { scale: 0.98 }}
                  className={`w-full px-4 py-3 ${bg} ${color} rounded-xl font-medium transition-opacity ${
                    type === "processing"
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:opacity-80"
                  }`}
                >
                  {type === "success" && "Super !"}
                  {type === "warning" && "J'ai compris"}
                  {type === "error" && "Réessayer"}
                  {type === "processing" && "Traitement en cours..."}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
