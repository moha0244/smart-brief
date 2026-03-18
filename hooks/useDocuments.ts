// hooks/useDocuments.ts
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Document } from "@/lib/types/common";

export function useDocuments(
  sessionToken: string,
  filterStatus: string = "all",
  refreshKey?: number,
) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const documentsRef = useRef<Document[]>([]);

  const fetchDocuments = useCallback(async () => {
    if (!sessionToken) {
      console.log(" En attente du sessionToken...");
      return;
    }

    try {
      let query = supabase
        .from("documents")
        .select("*")
        .eq("session_token", sessionToken);

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;

      console.log(
        ` ${data?.length || 0} documents pour session ${sessionToken.substring(0, 8)}...`,
      );
      setDocuments(data || []);
      documentsRef.current = data || [];
    } catch (error) {
      console.error("Erreur chargement:", error);
    }
  }, [sessionToken, filterStatus]);

  // Annuler les imports en cours au chargement initial
  const cancelProcessingDocuments = useCallback(async () => {
    if (!sessionToken) return;

    try {
      // Supprimer complètement les documents en cours au lieu de les mettre en erreur
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("session_token", sessionToken)
        .eq("status", "en cours");

      if (error) {
        console.error("Erreur suppression des imports:", error);
      } else {
        console.log("🗑️ Documents en cours supprimés suite au refresh");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  }, [sessionToken]);

  // Chargement initial et lors des changements
  useEffect(() => {
    if (sessionToken) {
      setLoading(true);
      
      // Nettoyer les timestamps d'upload existants (indique un refresh)
      const existingUploadTime = sessionStorage.getItem('uploadStartTime');
      if (existingUploadTime) {
        sessionStorage.removeItem('uploadStartTime');
        console.log(" Refresh détecté pendant upload - suppression des documents en cours");
        cancelProcessingDocuments();
      }
      
      fetchDocuments().finally(() => setLoading(false));
    }
  }, [sessionToken, filterStatus, refreshKey, fetchDocuments, cancelProcessingDocuments]);

  // Polling toutes les 2 secondes pour vérifier le statut des documents en cours
  useEffect(() => {
    if (!sessionToken) return;

    const interval = setInterval(() => {
      // Vérifier s'il y a des documents en cours de traitement
      const processingDocs = documentsRef.current.filter(doc => doc.status === "en cours");
      if (processingDocs.length > 0) {
        console.log(` Polling: ${processingDocs.length} document(s) en cours de traitement...`);
        fetchDocuments();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionToken, fetchDocuments]);

  return {
    documents,
    loading,
    fetchDocuments,
    setDocuments,
  };
}
