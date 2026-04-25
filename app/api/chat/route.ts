// app/api/chat/route.ts
import { NextResponse } from "next/server";
import { Mistral } from "@mistralai/mistralai";
import { PROMPTS } from "@/lib/prompts";

export async function POST(req: Request) {
  try {
    // Récupérer les données de la requête
    const { message, context, conversationId, documentId } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message requis" }, { status: 400 });
    }

    // Initialiser Mistral avec ta clé
    const mistral = new Mistral({
      apiKey: process.env.MISTRAL_API_KEY!,
    });
    

    // Construire le prompt avec le contexte du document
    const prompt = PROMPTS.CHAT(
      context || "Aucun contexte spécifique trouvé.",
      message,
    );

    // Générer la réponse avec Mistral
    const result = await mistral.chat.complete({
      model: "mistral-small-latest",
      messages: [{ role: "user", content: prompt }],
    });
    const text = result.choices[0].message.content;

    // Retourner la réponse en JSON
    return NextResponse.json({
      response: text,
      success: true,
    });
  } catch (error) {
    // En cas d'erreur, retourner un message d'erreur
    return NextResponse.json(
      {
        response: "Désolé, une erreur est survenue. Veuillez réessayer.",
        error: error instanceof Error ? error.message : "Erreur inconnue",
        success: false,
      },
      { status: 500 },
    );
  }
}
