import { LoadingState } from "@/components/ui/LoadingSpinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { MotionTransition } from "@/components/ui/MotionTransition";
import { Button } from "@/components/ui/Button";
import { ResumeControls } from "./resume/ResumeControls";
import { ResumeSections } from "./resume/ResumeSections";
import { FiCpu } from "react-icons/fi";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mistral } from "@mistralai/mistralai";
import { supabase } from "@/lib/supabase";

import { ResumeTabProps, ResumeData } from "@/lib/types";
import { PROMPTS } from "@/lib/prompts";

export function ResumeTab({ documentId, documentContent }: ResumeTabProps) {
  const [resumeLength, setResumeLength] = useState<
    "court" | "moyen" | "approfondi"
  >("moyen");
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (documentId) {
      checkCache();
    }
  }, [documentId, resumeLength]);

  const checkCache = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("document_summaries")
        .select("summary")
        .eq("document_id", documentId)
        .eq("length", resumeLength)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setResume(data.summary);
      } else {
        if (documentContent) {
          generateResume();
        }
      }
    } catch (err) {
      console.error("Erreur cache:", err);
      setError("Erreur lors de la vérification du cache");
    } finally {
      setLoading(false);
    }
  };

  const generateResume = async () => {
    if (!documentContent) {
      setError("Le document n'a pas de contenu");
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const mistral = new Mistral({
        apiKey: process.env.NEXT_PUBLIC_MISTRAL_API_KEY!,
      });

      const prompt =
        PROMPTS.RESUME[
          resumeLength.toUpperCase() as keyof typeof PROMPTS.RESUME
        ](documentContent);

      const result = await mistral.chat.complete({
        model: "mistral-small-latest",
        messages: [{ role: "user", content: prompt }],
      });
      const response = result.choices[0].message.content || "";
      const text = response;

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Réponse invalide");

      const summaryData = JSON.parse(jsonMatch[0]);

      await supabase
        .from("document_summaries")
        .delete()
        .eq("document_id", documentId)
        .eq("length", resumeLength);

      await supabase.from("document_summaries").insert({
        document_id: documentId,
        length: resumeLength,
        summary: summaryData,
      });

      setResume(summaryData);
    } catch (err) {
      console.error("Erreur génération:", err);
      setError("Erreur lors de la génération");
    } finally {
      setGenerating(false);
    }
  };

  if (loading || generating) {
    return (
      <MotionTransition
        type="fade"
        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
      >
        <LoadingState message="Génération du résumé..." size="lg" />
      </MotionTransition>
    );
  }

  if (error) {
    return (
      <ErrorState message={error} onRetry={checkCache} retryText="Réessayer" />
    );
  }

  if (!resume) {
    return (
      <MotionTransition
        type="fade"
        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
      >
        <div className="flex gap-2 mb-6">
          {["court", "moyen", "approfondi"].map((len) => (
            <Button
              key={len}
              onClick={() => setResumeLength(len as any)}
              variant="secondary"
              active={resumeLength === len}
              size="sm"
            >
              {len === "court"
                ? "Court"
                : len === "moyen"
                  ? "Moyen"
                  : "Approfondi"}
            </Button>
          ))}
        </div>
        <div className="text-center py-12">
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block p-4 bg-indigo-50 rounded-full mb-4"
          >
            <FiCpu className="w-8 h-8 text-indigo-400" />
          </motion.div>
          <p className="text-gray-500">Génération du résumé en cours...</p>
        </div>
      </MotionTransition>
    );
  }

  return (
    <MotionTransition
      type="slide"
      direction="up"
      className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
    >
      <ResumeControls
        resumeLength={resumeLength}
        onLengthChange={setResumeLength}
        onRegenerate={() => generateResume()}
        documentId={documentId}
        resume={resume}
      />

      <ResumeSections resume={resume} resumeLength={resumeLength} />
    </MotionTransition>
  );
}
