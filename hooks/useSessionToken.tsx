// hooks/useSessionToken.ts
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function useSessionToken() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    //  Essayer de récupérer depuis l'URL
    const urlToken = searchParams.get("session");

    // Essayer depuis localStorage
    const storedToken = localStorage.getItem("sessionToken");

    //  Utiliser le premier disponible
    const finalToken = urlToken || storedToken;

    if (finalToken) {
      setToken(finalToken);
      // Synchroniser localStorage
      localStorage.setItem("sessionToken", finalToken);
    }
  }, [searchParams]);

  return token;
}
