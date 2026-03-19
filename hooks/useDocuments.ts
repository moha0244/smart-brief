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

      setDocuments(data || []);
      documentsRef.current = data || [];
    } catch {
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
      } else {
      }
    } catch {
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
