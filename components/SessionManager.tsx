// components/SessionManager.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { FiCopy, FiCheck, FiLink } from "react-icons/fi";

export function SessionManager() {
  const router = useRouter();
  const pathname = usePathname();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isNewSession, setIsNewSession] = useState(false);

  // Générer un token aléatoire de 16 caractères
  const generateSessionToken = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Sauvegarder la session en base
  const saveSession = async (token: string) => {
    try {
      const { error } = await supabase
        .from("user_sessions")
        .insert({ session_token: token });

      if (error) throw error;
      console.log("✅ Session sauvegardée:", token);
    } catch (error) {
      console.error("❌ Erreur sauvegarde session:", error);
    }
  };

  // Vérifier si le token existe en base
  const validateSession = async (token: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("user_sessions")
        .select("id")
        .eq("session_token", token)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error("❌ Erreur validation session:", error);
      return false;
    }
  };

  // Gérer la session au chargement
  useEffect(() => {
    const initSession = async () => {
      // Vérifier si on a un token dans l'URL
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get("session");

      if (urlToken) {
        // Token dans l'URL : valider et charger
        const isValid = await validateSession(urlToken);
        if (isValid) {
          setSessionToken(urlToken);
          localStorage.setItem("sessionToken", urlToken);
          setIsNewSession(false);
        } else {
          // Token invalide, rediriger vers nouvelle session
          const newToken = generateSessionToken();
          await saveSession(newToken);
          setSessionToken(newToken);
          localStorage.setItem("sessionToken", newToken);
          setIsNewSession(true);

          // Rediriger avec le nouveau token
          router.push(`/?session=${newToken}`);
        }
      } else {
        // Pas de token dans l'URL : vérifier le localStorage
        const storedToken = localStorage.getItem("sessionToken");

        if (storedToken) {
          const isValid = await validateSession(storedToken);
          if (isValid) {
            setSessionToken(storedToken);
            setIsNewSession(false);
            // Mettre à jour l'URL avec le token
            router.push(`/?session=${storedToken}`, { scroll: false });
          } else {
            // Token invalide, en créer un nouveau
            localStorage.removeItem("sessionToken");
            const newToken = generateSessionToken();
            await saveSession(newToken);
            setSessionToken(newToken);
            localStorage.setItem("sessionToken", newToken);
            setIsNewSession(true);
            router.push(`/?session=${newToken}`);
          }
        } else {
          const newToken = generateSessionToken();
          await saveSession(newToken);
          setSessionToken(newToken);
          localStorage.setItem("sessionToken", newToken);
          setIsNewSession(true);
          router.push(`/?session=${newToken}`);
        }
      }
    };

    initSession();
  }, []);

  useEffect(() => {
    if (isNewSession && sessionToken) {
      setShowPopup(true);
    }
  }, [isNewSession, sessionToken]);

  const copyToClipboard = async () => {
    const url = `${window.location.origin}/?session=${sessionToken}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowPopup(false);
    }, 2000);
  };

  if (!sessionToken) return null;

  return (
    <AnimatePresence>
      {showPopup && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowPopup(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <FiLink className="w-8 h-8 text-indigo-600" />
              </motion.div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Sauvegardez votre lien !
              </h3>

              <p className="text-gray-500 mb-6">
                Ce lien unique vous permet de retrouver tous vos documents.
                Gardez-le précieusement !
              </p>

              <div className="bg-gray-50 rounded-xl p-3 mb-6 border border-gray-200">
                <p className="text-sm font-mono text-gray-600 break-all">
                  {`${window.location.origin}/?session=${sessionToken}`}
                </p>
              </div>

              <motion.button
                onClick={copyToClipboard}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <FiCheck className="w-5 h-5" />
                    Copié !
                  </>
                ) : (
                  <>
                    <FiCopy className="w-5 h-5" />
                    Copier le lien
                  </>
                )}
              </motion.button>

              <button
                onClick={() => setShowPopup(false)}
                className="mt-4 text-sm text-gray-400 hover:text-gray-600"
              ></button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
