"use server";

import { after } from "next/server";
import { supabase } from "@/lib/supabase-admin";
import { ApiError } from "@/lib/types/common";
import { PROMPTS } from "@/lib/prompts";
// @ts-expect-error - pdf-parse n'a pas de types TypeScript
import pdf from "pdf-parse";
import { Mistral } from "@mistralai/mistralai";

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY!,
});

// Fonction OCR avec Mistral Vision
async function extractTextWithOCR(
  file: File,
): Promise<{ text: string; pages: number }> {
  try {

    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(
        `Fichier trop volumineux pour l'OCR (${(file.size / 1024 / 1024).toFixed(2)}MB > 20MB max)`,
      );
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const result = await mistral.chat.complete({
      model: "mistral-small-latest",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: PROMPTS.OCR,
            },
            {
              type: "image_url",
              imageUrl: {
                url: `data:${file.type};base64,${base64}`,
              },
            },
          ],
        },
      ],
    });

    const text = result.choices[0]?.message?.content as string || "";

    if (!text || text.trim().length === 0) {
      throw new Error("Mistral n'a trouvé aucun texte dans le document");
    }

    const pages = Math.max(1, (text.match(/Page \d+:/g) || []).length);

    return { text, pages };
  } catch (error: unknown) {
    const apiError = error as ApiError;

    if (apiError.message?.includes("File size")) {
      throw new Error("Le fichier est trop volumineux pour l'OCR (max 20MB)");
    } else if (apiError.message?.includes("quota")) {
      throw new Error("Quota d'API dépassé. Réessayez plus tard.");
    } else if (apiError.message?.includes("invalid")) {
      throw new Error("Format de fichier invalide pour l'OCR");
    } else if (apiError.message?.includes("text")) {
      throw new Error("Aucun texte détecté dans le document scanné");
    } else {
      throw new Error(
        `Échec de l'OCR: ${apiError.message || "Erreur inconnue"}`,
      );
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

  if (!uploadStartTime) {
    return {
      success: false,
      error: "Session d'upload expirée (refresh détecté)",
    };
  }

  try {
    const fileName = `${Date.now()}_${encodeURIComponent(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let numPages = 0;
    let fullText = "";
    let extractionSuccess = true;
    let extractionMessage = "";

    try {
      const pdfData = await pdf(buffer);
      numPages = pdfData.numpages;
      fullText = pdfData.text;

      const textLength = fullText.trim().length;

      if (textLength < 100) {
        try {
          const ocrResult = await extractTextWithOCR(file);
          fullText = ocrResult.text;
          numPages = ocrResult.pages;
          extractionSuccess = true;
          extractionMessage = "Texte extrait avec OCR (Mistral Vision)";
        } catch {
          extractionSuccess = false;
          extractionMessage =
            "Le PDF semble être scanné et l'OCR a échoué. Essayez avec un PDF contenant du texte.";
        }
      } else {
        extractionMessage = "Texte extrait avec pdf-parse";
      }
    } catch {

      try {
        const ocrResult = await extractTextWithOCR(file);
        fullText = ocrResult.text;
        numPages = ocrResult.pages;
        extractionSuccess = true;
        extractionMessage = "Texte extrait avec OCR (pdf-parse échoué)";
      } catch {
        extractionSuccess = false;
        extractionMessage =
          "Impossible de lire le contenu du PDF. Le fichier est peut-être corrompu ou non supporté.";
        numPages = 1;
        fullText = "";
      }
    }

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
    if (!doc) throw new Error("Failed to create document record");

    if (extractionSuccess && fullText && fullText.length > 100) {

      after(async () => {
        try {
          await processDocumentWithMistral(doc.id, fullText);
        } catch (error) {
          await supabase
            .from("documents")
            .update({ status: "erreur" })
            .eq("id", doc.id);
        }
      });
    } else {
    }

    return {
      success: true,
      docId: doc.id,
      extractionSuccess,
      extractionMessage: extractionMessage || undefined,
      pages: numPages,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

async function asyncPool<T, R>(
  poolLimit: number,
  array: T[],
  iteratorFn: (item: T, index: number) => Promise<R> | R,
): Promise<R[]> {
  const ret: Promise<R>[] = [];
  const executing: Promise<void>[] = [];

  for (const [index, item] of array.entries()) {
    const p = Promise.resolve().then(() => iteratorFn(item, index));
    ret.push(p);

    const e: Promise<void> = p.then(() => {
      const i = executing.indexOf(e);
      if (i > -1) executing.splice(i, 1);
    });

    executing.push(e);

    if (executing.length >= poolLimit) {
      await Promise.race(executing);
    }
  }

  return Promise.all(ret);
}

async function processDocumentWithMistral(docId: string, text: string) {
  const maxRetries = 2;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      const chunks = splitIntoChunks(text, 1000);

      const results: Array<{
        index: number;
        embedding: number[];
        content: string;
      }> = [];

      for (let i = 0; i < chunks.length; i++) {

        try {

          const embeddingPromise = mistral.embeddings.create({
            model: "mistral-embed",
            inputs: [chunks[i]],
          });
          const timeoutChunk = new Promise<never>((_, reject) => {
            setTimeout(
              () => reject(new Error(`Timeout chunk ${i + 1} après 30s`)),
              30000,
            );
          });

          const result = await Promise.race([embeddingPromise, timeoutChunk]);

          if (!result.data?.[0]?.embedding) {
            throw new Error(`No embedding returned for chunk ${i + 1}`);
          }

          results.push({
            index: i,
            embedding: result.data[0].embedding,
            content: chunks[i],
          });

        } catch (chunkError) {
          const errorMessage = chunkError instanceof Error ? chunkError.message : String(chunkError);
          throw new Error(`Embedding generation failed for chunk ${i + 1}: ${errorMessage}`);
        }
      }

      await asyncPool(2, results, async ({ index, embedding, content }) => {

        const insertPromise = supabase
          .from("document_chunks")
          .insert({
            document_id: docId,
            content,
            embedding,
            chunk_index: index,
          })
          .select();

        const timeoutInsert = new Promise<never>((_, reject) => {
          setTimeout(
            () => reject(new Error(`Timeout insertion ${index + 1}`)),
            10000,
          );
        });

        const { data, error } = (await Promise.race([
          insertPromise,
          timeoutInsert,
        ])) as { data: unknown; error: unknown };

        if (error) {
          throw new Error(
            `Insertion failed for chunk ${index}: ${(error as Error).message}`,
          );
        }

        return data;
      });

      await supabase
        .from("documents")
        .update({ status: "traite" })
        .eq("id", docId);

      return;
    } catch {
      retryCount++;

      if (retryCount <= maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, retryCount * 2000),
        );
      } else {
        await supabase
          .from("documents")
          .update({ status: "erreur" })
          .eq("id", docId);
      }
    }
  }
}

function splitIntoChunks(text: string, size: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.substring(i, i + size));
  }
  return chunks;
}