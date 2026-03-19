// app/page.tsx
"use client";

import { SearchInput } from "@/components/ui/SearchInput";
import { DocumentList } from "@/components/DocumentList";
import { UploadButton } from "@/components/upload/UploadButton";
import { SessionManager } from "@/components/SessionManager";
import { useState, useEffect, useCallback, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";

function HomeContent() {
  const searchParams = useSearchParams();
  const sessionToken = searchParams.get("session");

  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [documentCount, setDocumentCount] = useState(0);

  // Filtrer les documents par session
  useEffect(() => {
    if (sessionToken) {
      localStorage.setItem("currentSession", sessionToken);
    }
  }, [sessionToken]);

  const fetchDocumentCount = useCallback(async () => {
    let query = supabase
      .from("documents")
      .select("*", { count: "exact", head: true });

    if (sessionToken) {
      query = query.eq("session_token", sessionToken);
    }

    const { count } = await query;
    setDocumentCount(count || 0);
  }, [sessionToken, supabase]);

  useEffect(() => {
    const fetchCount = async () => {
      await fetchDocumentCount();
    };
    fetchCount();
  }, [sessionToken, fetchDocumentCount]);

  const handleUploadSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setTimeout(fetchDocumentCount, 100);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Gestionnaire de session */}
      <SessionManager />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes documents</h1>
          <p className="text-gray-500 mt-1">
            {documentCount} document{documentCount !== 1 ? "s" : ""} dans votre
            bibliothèque
          </p>
          {sessionToken && (
            <p className="text-xs text-gray-400 mt-1 font-mono">
              Session: {sessionToken.substring(0, 8)}...
            </p>
          )}
        </div>

        <UploadButton onUploadSuccess={handleUploadSuccess} />
      </div>

      {/* Barre de recherche */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        className="mb-6"
      />

      {/* Liste des documents */}
      <DocumentList
        refreshKey={refreshKey}
        searchQuery={searchQuery}
        onCountChange={setDocumentCount}
        sessionToken={sessionToken}
      />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-8">Chargement...</div>}>
      <HomeContent />
    </Suspense>
  );
}
