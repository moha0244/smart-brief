// app/api/chat/route.ts
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PROMPTS } from "@/lib/prompts";

export async function POST(req: Request) {
  try {
    // Récupérer les données de la requête
    const { message, context, conversationId, documentId } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message requis" }, { status: 400 });
    }

    // Initialiser Gemini avec ta clé
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // Modèle gratuit
    });

    // Construire le prompt avec le contexte du document
    const prompt = PROMPTS.CHAT(
      context || "Aucun contexte spécifique trouvé.",
      message,
    );

    // Générer la réponse avec Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

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
