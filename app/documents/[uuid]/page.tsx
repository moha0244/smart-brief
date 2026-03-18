// app/documents/[uuid]/page.tsx
"use client";

import { DateFormat } from "@/components/ui/DateFormat";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { LoadingState } from "@/components/ui/LoadingSpinner";
import { MotionTransition } from "@/components/ui/MotionTransition";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useSessionToken } from "@/hooks/useSessionToken";
import { ResumeTab } from "@/components/ResumeTab";
import { ChatTab } from "@/components/ChatTab";
import {
  FiFileText,
  FiCalendar,
  FiBookOpen,
  FiAlertCircle,
  FiChevronLeft,
  FiHome,
  FiLock,
  FiMessageCircle,
} from "react-icons/fi";
import { FlashcardsTab } from "@/components/FlashCardTab";

export default function DocumentPage() {
  const params = useParams();
  const documentUuid = params.uuid as string;
  const sessionToken = useSessionToken();

  const [document, setDocument] = useState<{
    id: string;
    uuid: string;
    title: string;
    created_at: string;
    pages: number;
    status: "traite" | "en cours" | "erreur";
    full_text?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"resume" | "flashcards" | "chat">(
    "resume",
  );

  useEffect(() => {
    if (sessionToken && documentUuid) {
      fetchDocument();
    }
  }, [documentUuid, sessionToken]);

  const fetchDocument = async () => {
    try {
      // Vérifie que le document appartient bien à la session
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("uuid", documentUuid) //  Recherche par UUID
        .eq("session_token", sessionToken) // Vérification de session
        .single();

      if (error || !data) {
        if (error?.code === "PGRST116") {
          // Document non trouvé ou pas le bon propriétaire
          setUnauthorized(true);
        } else {
          setNotFound(true);
        }
      } else {
        setDocument(data);
      }
    } catch (error) {
      console.error("Erreur:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <MotionTransition type="slide" direction="up">
            <div className="space-y-6">
              {/* Skeleton header */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="h-8 w-2/3 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="flex items-center gap-4">
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              {/* Skeleton tabs */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"
                  ></div>
                ))}
              </div>
              {/* Skeleton content */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <LoadingState message="Chargement du document..." />
              </div>
            </div>
          </MotionTransition>
        </div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <MotionTransition
        type="scale"
        className="min-h-screen bg-gray-50 flex items-center justify-center"
      >
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            className="inline-block p-6 bg-red-50 rounded-full mb-6"
          >
            <FiLock className="w-12 h-12 text-red-400" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Accès non autorisé
          </h1>
          <p className="text-gray-500 mb-8">
            Ce document ne vous appartient pas ou n'existe pas.
          </p>
          <motion.a
            href="/"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <FiHome className="w-5 h-5" />
            Retour aux documents
          </motion.a>
        </div>
      </MotionTransition>
    );
  }

  if (notFound || !document) {
    return (
      <MotionTransition
        type="scale"
        className="min-h-screen bg-gray-50 flex items-center justify-center"
      >
        <div className="text-center">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block p-6 bg-red-50 rounded-full mb-6"
          >
            <FiAlertCircle className="w-12 h-12 text-red-400" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-500 mb-8">Document non trouvé</p>
          <motion.a
            href="/"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <FiHome className="w-5 h-5" />
            Retour aux documents
          </motion.a>
        </div>
      </MotionTransition>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation et actions */}
        <div className="flex items-center justify-between mb-6">
          <motion.a
            href="/"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <FiChevronLeft className="w-5 h-5" />
            Retour
          </motion.a>

          {/* Affichage de l'UUID (optionnel - pour debug) */}
          {/* <div className="text-xs text-gray-400 font-mono">
            ID: {document.uuid.substring(0, 8)}...
          </div> */}
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  className="p-3 bg-indigo-50 rounded-xl"
                  animate={{
                    rotate: [0, -5, 5, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FiFileText className="w-6 h-6 text-indigo-600" />
                </motion.div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {document.title}
                </h1>
              </div>

              <div className="flex items-center gap-4 text-gray-600">
                <motion.div
                  className="flex items-center gap-1.5"
                  whileHover={{ scale: 1.05 }}
                >
                  <FiCalendar className="w-4 h-4" />
                  <DateFormat
                    date={document.created_at}
                    className="text-gray-600"
                  />
                </motion.div>

                <span className="w-1 h-1 bg-gray-300 rounded-full" />

                <motion.div
                  className="flex items-center gap-1.5"
                  whileHover={{ scale: 1.05 }}
                >
                  <FiBookOpen className="w-4 h-4" />
                  <span>{document.pages} pages</span>
                </motion.div>
              </div>
            </div>

            <StatusIndicator status={document.status} size="md" />
          </div>
        </motion.div>

        {/* Navigation par onglets */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 mb-6"
        >
          <div className="flex gap-2">
            {[
              { id: "resume", label: "Résumé", icon: FiFileText },
              { id: "flashcards", label: "Flashcards", icon: FiBookOpen },
              { id: "chat", label: "Chat", icon: FiMessageCircle },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() =>
                  setActiveTab(tab.id as "resume" | "flashcards" | "chat")
                }
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Contenu des onglets avec animations */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "resume" && (
              <ResumeTab
                documentId={document.id}
                documentContent={document.full_text}
              />
            )}
            {activeTab === "flashcards" && (
              <FlashcardsTab
                documentId={document.id}
                documentContent={document.full_text}
              />
            )}
            {activeTab === "chat" && <ChatTab documentId={document.id} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
