// app/actions/uploadDocument.ts
"use server";

import { supabase } from "@/lib/supabase-admin";
import { ApiError } from "@/lib/types/common";
import { PROMPTS } from "@/lib/prompts";
// @ts-expect-error - pdf-parse n'a pas de types TypeScript
import pdf from "pdf-parse";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Fonction OCR avec Gemini Vision
async function extractTextWithOCR(
  file: File,
): Promise<{ text: string; pages: number }> {
  try {
    console.log(" Tentative d'extraction OCR avec Gemini Vision...");
    console.log(
      ` Fichier: ${file.name}, Taille: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    );

    // Vérifier la taille du fichier
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      throw new Error(
        `Fichier trop volumineux pour l'OCR (${(file.size / 1024 / 1024).toFixed(2)}MB > 20MB max)`,
      );
    }

    // Convertir le fichier en base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    console.log(`Base64 généré: ${base64.length} caractères`);

    // Utiliser Gemini Vision pour extraire le texte
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192,
      },
    });

    const prompt = PROMPTS.OCR;

    console.log("🤖 Envoi à Gemini Vision...");
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64,
          mimeType: file.type,
        },
      },
    ]);

    const text = result.response.text();
    console.log(` Réponse Gemini: ${text.length} caractères`);

    if (!text || text.trim().length === 0) {
      throw new Error("Gemini n'a trouvé aucun texte dans le document");
    }

    const pages = Math.max(1, (text.match(/Page \d+:/g) || []).length);

    console.log(`✅ OCR réussi: ${text.length} caractères sur ${pages} pages`);
    return { text, pages };
  } catch (error: ApiError) {
    console.error("❌ Erreur OCR détaillée:", {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      name: error.name,
    });

    // Messages d'erreur spécifiques
    if (error.message?.includes("File size")) {
      throw new Error("Le fichier est trop volumineux pour l'OCR (max 20MB)");
    } else if (error.message?.includes("quota")) {
      throw new Error("Quota d'API dépassé. Réessayez plus tard.");
    } else if (error.message?.includes("invalid")) {
      throw new Error("Format de fichier invalide pour l'OCR");
    } else if (error.message?.includes("text")) {
      throw new Error("Aucun texte détecté dans le document scanné");
    } else {
      throw new Error(`Échec de l'OCR: ${error.message || "Erreur inconnue"}`);
    }
  }
}

export async function uploadDocument(formData: FormData) {
  const file = formData.get("file") as File;
  const sessionToken = formData.get("sessionToken") as string;
  const uploadStartTime = formData.get("uploadStartTime") as string;

  if (!file) {
    return { success: false, error: "Aucun fichier fourni" };
  }

  if (!sessionToken) {
    return { success: false, error: "Session invalide" };
  }

  // Vérifier si la page a été rafraîchie pendant l'upload
  if (!uploadStartTime) {
    return { success: false, error: "Session d'upload expirée (refresh détecté)" };
  }

  try {
    //  Upload du fichier
    const fileName = `${Date.now()}_${encodeURIComponent(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Lire le PDF avec pdf-parse uniquement
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let numPages = 0;
    let fullText = "";
    let extractionSuccess = true;
    let extractionMessage = "";

    try {
      console.log("📄 Tentative d'extraction avec pdf-parse...");
      const pdfData = await pdf(buffer);
      numPages = pdfData.numpages;
      fullText = pdfData.text;

      // Vérifier si le texte extrait est significatif
      const textLength = fullText.trim().length;
      console.log(
        `📊 Texte extrait: ${textLength} caractères sur ${numPages} pages`,
      );

      // Si le texte est trop court, essayer l'OCR
      if (textLength < 100) {
        console.log("⚠️ Texte insuffisant, tentative d'OCR...");
        try {
          const ocrResult = await extractTextWithOCR(file);
          fullText = ocrResult.text;
          numPages = ocrResult.pages;
          extractionSuccess = true;
          extractionMessage = "Texte extrait avec OCR (Gemini Vision)";
          console.log("✅ OCR réussi");
        } catch (ocrError) {
          console.error("❌ OCR échoué:", ocrError);
          extractionSuccess = false;
          extractionMessage =
            "Le PDF semble être scanné et l'OCR a échoué. Essayez avec un PDF contenant du texte.";
        }
      } else {
        console.log("✅ Extraction PDF réussie");
        extractionMessage = "Texte extrait avec pdf-parse";
      }
    } catch (pdfError) {
      console.error("❌ Erreur lecture PDF:", pdfError);

      // Si pdf-parse échoue complètement, essayer l'OCR
      try {
        console.log("📄 pdf-parse échoué, tentative d'OCR...");
        const ocrResult = await extractTextWithOCR(file);
        fullText = ocrResult.text;
        numPages = ocrResult.pages;
        extractionSuccess = true;
        extractionMessage = "Texte extrait avec OCR (pdf-parse échoué)";
        console.log("✅ OCR réussi en fallback");
      } catch (ocrError) {
        console.error("❌ OCR fallback échoué:", ocrError);
        extractionSuccess = false;
        extractionMessage =
          "Impossible de lire le contenu du PDF. Le fichier est peut-être corrompu ou non supporté.";
        numPages = 1;
        fullText = "";
      }
    }

    //  Créer l'entrée dans documents
    const { data: doc, error: dbError } = await supabase
      .from("documents")
      .insert({
        uuid: crypto.randomUUID(),
        title: file.name,
        status: extractionSuccess ? "en cours" : "erreur",
        pages: numPages,
        file_path: fileName,
        full_text: fullText || "[EXTRACTION ÉCHOUÉE]",
        session_token: sessionToken,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          pageCount: numPages,
          uploadDate: new Date().toISOString(),
          extractionSuccess,
          extractionMessage,
          isScanned: !extractionSuccess && fullText.length < 100,
        },
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // Lancer le traitement Gemini seulement si l'extraction a réussi
    if (extractionSuccess && fullText && fullText.length > 100) {
      console.log("🤖 Lancement du traitement Gemini...");

      processDocumentWithGemini(doc.id, fullText).catch((error) => {
        console.error("❌ Erreur traitement Gemini:", error);
        // Mettre à jour le statut en erreur si le traitement échoue
        supabase
          .from("documents")
          .update({ status: "erreur" })
          .eq("id", doc.id)
          .then(() => console.log(" Statut mis à jour: erreur"));
      });
    } else {
      console.log("⏸️ Traitement Gemini ignoré - extraction échouée");
    }

    return {
      success: true,
      docId: doc.id,
      extractionSuccess,
      extractionMessage: extractionMessage || undefined,
      pages: numPages,
    };
  } catch (error) {
    console.error(" Erreur globale:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

// Fonction utilitaire pour limiter la concurrence (file d'attente)
async function asyncPool<T, R>(
  poolLimit: number,
  array: T[],
  iteratorFn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const ret: Promise<R>[] = [];
  const executing: Promise<R>[] = [];
  for (const [index, item] of array.entries()) {
    const p = iteratorFn(item, index);
    ret.push(p);

    if (poolLimit <= array.length) {
      const e = p.then((result) => {
        const index = executing.indexOf(e);
        if (index > -1) executing.splice(index, 1);
        return result;
      });
      executing.push(e);
      if (executing.length >= poolLimit) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(ret);
}

async function processDocumentWithGemini(docId: string, text: string) {
  try {
    console.log("Début traitement Gemini...");
    const chunks = splitIntoChunks(text, 2000);
    console.log(`${chunks.length} chunks créés`);

    const embeddingModel = genAI.getGenerativeModel({
      model: "gemini-embedding-001",
    });

    //  On exécute les promesses de génération d'embedding avec une limite de concurrence
    const results = await asyncPool(2, chunks, async (chunk, index) => {
      console.log(`Génération embedding chunk ${index + 1}/${chunks.length}`);
      const result = await embeddingModel.embedContent(chunk);
      return { index, embedding: result.embedding.values, content: chunk };
    });

    // On exécute les insertions avec la même limite de concurrence
    await asyncPool(2, results, async ({ index, embedding, content }) => {
      console.log(`Tentative d'insertion chunk ${index + 1}/${chunks.length}`);
      const { data, error } = await supabase
        .from("document_chunks")
        .insert({
          document_id: docId,
          content: content,
          embedding: embedding,
          chunk_index: index,
        })
        .select();

      if (error) {
        console.error(`❌ Erreur insertion chunk ${index}:`, error);

        throw new Error(
          `Insertion failed for chunk ${index}: ${error.message}`,
        );
      }
      console.log(`✅ Chunk ${index + 1} inséré`);
      return data;
    });

    // Mettre à jour le statut du document
    await supabase
      .from("documents")
      .update({ status: "traite" })
      .eq("id", docId);

    console.log(" Traitement terminé avec succès!");
  } catch (error) {
    console.error(" Erreur traitement Gemini:", error);
    await supabase
      .from("documents")
      .update({ status: "erreur" })
      .eq("id", docId);
  }
}

function splitIntoChunks(text: string, size: number): string[] {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.substring(i, i + size));
  }
  return chunks;
}
