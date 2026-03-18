// components/UploadButton.tsx (déplacé vers components/upload/)
"use client";

import { useSessionToken } from "@/hooks/useSessionToken";
import { useState } from "react";
import { motion } from "framer-motion";
import { FiUpload } from "react-icons/fi";
import { UploadPopup } from "./UploadPopup";
import { uploadDocument } from "@/app/actions/UploadDocument";
import { UploadPopupState, UploadPopupDetails } from "@/lib/types/components";

export function UploadButton({
  onUploadSuccess,
}: {
  onUploadSuccess: () => void;
}) {
  const sessionToken = useSessionToken();
  const [uploading, setUploading] = useState(false);
  const [popup, setPopup] = useState<UploadPopupState>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifie si c'est un PDF
    if (file.type !== "application/pdf") {
      setPopup({
        isOpen: true,
        type: "error",
        title: "Format non supporté",
        message: "Seuls les fichiers PDF sont acceptés.",
      });
      return;
    }

    // Vérifie la taille du fichier (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setPopup({
        isOpen: true,
        type: "error",
        title: "Fichier trop volumineux",
        message: "La taille maximale autorisée est de 10MB.",
      });
      return;
    }

    if (!sessionToken) {
      setPopup({
        isOpen: true,
        type: "error",
        title: "Session invalide",
        message: "Votre session a expiré. Veuillez rafraîchir la page.",
      });
      return;
    }

    // Créer un timestamp pour cet upload et le stocker
    const uploadStartTime = Date.now().toString();
    sessionStorage.setItem('uploadStartTime', uploadStartTime);

    setUploading(true);
    setPopup({
      isOpen: true,
      type: "processing",
      title: "Import en cours...",
      message: "Votre document est en cours d'analyse.",
      details: {
        fileName: file.name,
      } as UploadPopupDetails,
    });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sessionToken", sessionToken);
      formData.append("uploadStartTime", uploadStartTime);

      const result = await uploadDocument(formData);

      // Nettoyer le timestamp après l'upload
      sessionStorage.removeItem('uploadStartTime');

      if (result.success) {
        if (result.extractionSuccess) {
          setPopup({
            isOpen: true,
            type: "success",
            title: "Import réussi !",
            message: "Votre document a été importé et sera bientôt disponible.",
            details: {
              fileName: file.name,
              pages: result.pages,
              extractionMethod: "Texte extrait automatiquement",
            } as UploadPopupDetails,
          });
        } else {
          setPopup({
            isOpen: true,
            type: "warning",
            title: "Import partiel",
            message:
              result.extractionMessage ||
              "Le document a été importé mais le texte n'a pas pu être extrait.",
            details: {
              fileName: file.name,
              extractionMethod: result.extractionMessage?.includes("OCR")
                ? "PDF scanné (OCR activé)"
                : "PDF standard",
            } as UploadPopupDetails,
          });
        }
        onUploadSuccess();
      } else {
        setPopup({
          isOpen: true,
          type: "error",
          title: "Erreur d'import",
          message:
            result.error ||
            "Une erreur technique est survenue. Veuillez réessayer.",
        });
      }
    } catch (error) {
      console.error("Erreur:", error);
      setPopup({
        isOpen: true,
        type: "error",
        title: "Erreur inattendue",
        message: "Une erreur technique est survenue. Veuillez réessayer.",
      });
    } finally {
      setUploading(false);
      e.target.value = ""; // Reset l'input
    }
  };

  return (
    <>
      <label
        className={`
          cursor-pointer bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium 
          hover:bg-indigo-700 transition-all flex items-center gap-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${uploading ? "opacity-75" : ""}
        `}
      >
        {uploading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
            <span>Import en cours...</span>
          </>
        ) : (
          <>
            <FiUpload className="w-5 h-5" />
            <span>Importer un PDF</span>
          </>
        )}
        <input
          type="file"
          className="hidden"
          accept="application/pdf"
          onChange={handleFileChange}
          disabled={uploading || !sessionToken}
        />
      </label>

      {/* Popup */}
      <UploadPopup
        isOpen={popup.isOpen}
        onClose={() => setPopup((prev) => ({ ...prev, isOpen: false }))}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        details={popup.details}
      />
    </>
  );
}
