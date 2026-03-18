// components/ConfirmDialog.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiAlertCircle, FiCheckCircle, FiX, FiTrash2 } from "react-icons/fi";
import { ConfirmDialogItem } from "@/lib/types/components";
import { ComponentType } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "success";
  itemDetails?: ConfirmDialogItem[];
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  type = "danger",
  itemDetails = [],
}: ConfirmDialogProps) {
  const typeConfig: Record<
    "danger" | "warning" | "success",
    {
      icon: ComponentType<any>;
      iconColor: string;
      bgColor: string;
      buttonColor: string;
      borderColor: string;
    }
  > = {
    danger: {
      icon: FiAlertCircle,
      iconColor: "text-red-500",
      bgColor: "bg-red-100",
      buttonColor: "bg-red-500 hover:bg-red-600",
      borderColor: "border-red-200",
    },
    warning: {
      icon: FiAlertCircle,
      iconColor: "text-orange-500",
      bgColor: "bg-orange-100",
      buttonColor: "bg-orange-500 hover:bg-orange-600",
      borderColor: "border-orange-200",
    },
    success: {
      icon: FiCheckCircle,
      iconColor: "text-emerald-500",
      bgColor: "bg-emerald-100",
      buttonColor: "bg-emerald-500 hover:bg-emerald-600",
      borderColor: "border-emerald-200",
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50"
          >
            <div
              className={`h-2 w-full ${config.buttonColor.replace("hover:", "")}`}
            />

            <div className="p-6">
              {/* Bouton fermer */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className={`w-16 h-16 ${config.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                <Icon className={`w-8 h-8 ${config.iconColor}`} />
              </motion.div>

              {/* Titre */}
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                {title}
              </h3>

              {/* Message */}
              <p className="text-gray-500 text-center mb-6">{message}</p>

              {/* Détails de l'élément */}
              {itemDetails.length > 0 && (
                <div
                  className={`bg-gray-50 rounded-xl p-4 mb-6 border ${config.borderColor}`}
                >
                  {itemDetails.map((detail, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-gray-500">{detail.label}:</span>
                      <span className="font-medium text-gray-900">
                        {detail.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  {cancelText}
                </motion.button>
                <motion.button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 px-4 py-3 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${config.buttonColor}`}
                >
                  {type === "danger" && <FiTrash2 className="w-4 h-4" />}
                  {confirmText}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
