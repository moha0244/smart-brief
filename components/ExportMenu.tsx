// components/ExportMenu.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiDownload,
  FiFileText,
  FiGrid,
  FiFile,
  FiX,
  FiCheck,
  FiCopy,
} from "react-icons/fi";

import { ExportOptions, Flashcard, ResumeData } from "@/lib/types/common";

interface ExportData {
  flashcards?: Flashcard[];
  overview?: string;
  keyPoints?: string[];
  definitions?: Array<{ term: string; definition: string }>;
  takeaways?: string[];
}

interface ExportMenuProps<T = ExportData> {
  data: T;
  filename?: string;
  formats?: Array<"json" | "csv" | "txt" | "pdf">;
  onExport?: (format: string) => void;
  buttonClassName?: string;
  menuClassName?: string;
}

export function ExportMenu<T = ExportData>({
  data,
  filename = "export",
  formats = ["json", "csv", "txt"],
  onExport,
  buttonClassName = "",
  menuClassName = "",
}: ExportMenuProps<T>) {
  const [showMenu, setShowMenu] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const formatConfig = {
    json: {
      icon: FiFileText,
      label: "JSON (données brutes)",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      mime: "application/json",
      extension: "json",
    },
    csv: {
      icon: FiGrid,
      label: "CSV (Excel/tableur)",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      mime: "text/csv",
      extension: "csv",
    },
    txt: {
      icon: FiFile,
      label: "TXT (texte brut)",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      mime: "text/plain",
      extension: "txt",
    },
    pdf: {
      icon: FiFile,
      label: "PDF (impression)",
      color: "text-red-600",
      bgColor: "bg-red-50",
      mime: "application/pdf",
      extension: "pdf",
    },
  };

  const handleExport = async (format: string) => {
    setExporting(format);

    try {
      let content: string | Blob;
      let mimeType: string;
      let fileExtension: string;

      switch (format) {
        case "json":
          content = JSON.stringify(data, null, 2);
          mimeType = "application/json";
          fileExtension = "json";
          break;

        case "csv":
          content = convertToCSV(data);
          mimeType = "text/csv";
          fileExtension = "csv";
          break;

        case "txt":
          content = convertToTXT(data);
          mimeType = "text/plain";
          fileExtension = "txt";
          break;

        case "pdf":
          alert("L'export PDF sera bientôt disponible !");
          setExporting(null);
          setShowMenu(false);
          return;

        default:
          throw new Error(`Format non supporté: ${format}`);
      }

      // Crée et télécharge le fichier
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}-${Date.now()}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Callback pour le composant parent
      onExport?.(format);

      // Feedback visuel
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Erreur export:", error);
    } finally {
      setExporting(null);
      setShowMenu(false);
    }
  };

  // Convertit en CSV (pour flashcards ou résumés)
  const convertToCSV = (data: ExportData): string => {
    if (data.flashcards && Array.isArray(data.flashcards)) {
      // Format spécifique flashcards
      const headers = "Page,Question,Réponse";
      const rows = data.flashcards.map(
        (card: Flashcard) =>
          `${card.page},"${card.question.replace(/"/g, '""')}","${card.answer.replace(/"/g, '""')}",`,
      );
      return [headers, ...rows].join("\n");
    }

    // Format pour résumés
    if (data.overview || data.keyPoints) {
      const headers = "Type,Contenu";
      const rows: string[] = [];

      if (data.overview) {
        rows.push(`"Vue d'ensemble","${data.overview.replace(/"/g, '""')}"`);
      }

      if (data.keyPoints) {
        data.keyPoints.forEach((point, index) => {
          rows.push(`"Point ${index + 1}","${point.replace(/"/g, '""')}"`);
        });
      }

      return [headers, ...rows].join("\n");
    }

    return "";
  };

  // Convertir en TXT
  const convertToTXT = (data: ExportData): string => {
    if (data.flashcards && Array.isArray(data.flashcards)) {
      return data.flashcards
        .map(
          (card: Flashcard, i: number) =>
            `--- Carte ${i + 1} (Page ${card.page}) ---\nQ: ${card.question}\nR: ${card.answer}\n`,
        )
        .join("\n");
    }

    // Format pour résumés
    if (data.overview || data.keyPoints) {
      let result = "";

      if (data.overview) {
        result += `Vue d'ensemble:\n${data.overview}\n\n`;
      }

      if (data.keyPoints) {
        result += "Points clés:\n";
        data.keyPoints.forEach((point, index) => {
          result += `${index + 1}. ${point}\n`;
        });
      }

      return result;
    }

    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowMenu(!showMenu)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors relative ${buttonClassName}`}
        title="Exporter"
      >
        {copied ? (
          <FiCheck className="w-5 h-5 text-green-500" />
        ) : (
          <FiDownload className="w-5 h-5" />
        )}
      </motion.button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50 ${menuClassName}`}
          >
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <span className="text-xs font-medium text-gray-500">
                Exporter en
              </span>
              <button
                onClick={() => setShowMenu(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <div className="p-1">
              {formats.map((format) => {
                const config = formatConfig[format];
                if (!config) return null;
                const Icon = config.icon;

                return (
                  <motion.button
                    key={format}
                    onClick={() => handleExport(format)}
                    disabled={exporting !== null}
                    whileHover={{ x: 4 }}
                    className={`w-full px-3 py-2 rounded-lg text-left text-sm hover:bg-gray-50 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors group`}
                  >
                    <div
                      className={`p-1.5 rounded-lg ${config.bgColor} group-hover:scale-110 transition-transform`}
                    >
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <span className="flex-1 text-gray-700">{config.label}</span>
                    {exporting === format && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-400 flex items-center gap-1">
              <FiCopy className="w-3 h-3" />
              {new Date().toLocaleDateString()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
