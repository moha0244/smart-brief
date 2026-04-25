import { useState, useEffect } from "react";
import { Mistral } from "@mistralai/mistralai";
import { supabase } from "@/lib/supabase";
import { LoadingState } from "@/components/ui/LoadingSpinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { MotionTransition } from "@/components/ui/MotionTransition";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { FlashcardDisplay } from "./flashcard/FlashcardDisplay";
import { FlashcardHeader } from "./flashcard/FlashcardHeader";
import { FlashcardNavigation } from "./flashcard/FlashcardNavigation";
import { FiCpu } from "react-icons/fi";

import { FlashcardTabProps, Flashcard } from "@/lib/types";
import { PROMPTS } from "@/lib/prompts";

export function FlashcardsTab({
  documentId,
  documentContent,
}: FlashcardTabProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (documentId) checkCache();
  }, [documentId]);

  const checkCache = async () => {
    try {
      const { data, error } = await supabase
        .from("document_flashcards")
        .select("flashcards")
        .eq("document_id", documentId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFlashcards(data.flashcards);
        setLoading(false);
      } else if (documentContent) {
        generateFlashcards();
      } else {
        setLoading(false);
      }
    } catch {
      setError("Erreur lors de la vérification du cache");
      setLoading(false);
    }
  };

  const generateFlashcards = async () => {
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

      const approxPages = Math.ceil(documentContent.length / 2000);
      const prompt = PROMPTS.FLASHCARDS(
        documentContent,
        Math.min(approxPages, 10),
      );

      const result = await mistral.chat.complete({
        model: "mistral-small-latest",
        messages: [{ role: "user", content: prompt }],
      });
      const response = result.choices[0].message.content || "";
      const text = response;

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Réponse invalide");

      const newFlashcards = JSON.parse(jsonMatch[0]).flashcards || [];

      const { data: existing } = await supabase
        .from("document_flashcards")
        .select("id")
        .eq("document_id", documentId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("document_flashcards")
          .delete()
          .eq("document_id", documentId);
      }

      await supabase.from("document_flashcards").insert({
        document_id: documentId,
        flashcards: newFlashcards,
      });

      setFlashcards(newFlashcards);
    } catch {
      setError("Erreur lors de la génération");
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1);
      setShowAnswer(false);
    }
  };

  const handlePrev = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setShowAnswer(false);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...flashcards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setFlashcards(shuffled);
    setCurrentCard(0);
    setShowAnswer(false);
  };

  if (loading || generating) {
    return (
      <MotionTransition
        type="fade"
        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
      >
        <LoadingState message="Génération des flashcards..." size="lg" />
      </MotionTransition>
    );
  }

  if (error) {
    return (
      <ErrorState message={error} onRetry={checkCache} retryText="Réessayer" />
    );
  }

  if (flashcards.length === 0) {
    return (
      <MotionTransition
        type="fade"
        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
      >
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
          <p className="text-gray-500 mb-4">Aucune flashcard disponible</p>
          <Button
            onClick={generateFlashcards}
            icon={<FiCpu className="w-4 h-4" />}
          >
            Générer les flashcards
          </Button>
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
      <FlashcardHeader
        currentIndex={currentCard}
        totalCards={flashcards.length}
        onShuffle={handleShuffle}
        onRegenerate={generateFlashcards}
        documentId={documentId}
        flashcards={flashcards}
      />

      <FlashcardDisplay
        flashcard={flashcards[currentCard]}
        showAnswer={showAnswer}
        onToggle={() => setShowAnswer(!showAnswer)}
      />

      <FlashcardNavigation
        currentIndex={currentCard}
        totalCards={flashcards.length}
        onPrevious={handlePrev}
        onNext={handleNext}
        progress={((currentCard + 1) / flashcards.length) * 100}
      />
    </MotionTransition>
  );
}
