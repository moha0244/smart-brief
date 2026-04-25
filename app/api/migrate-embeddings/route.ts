import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-admin";
import { Mistral } from "@mistralai/mistralai";

function splitIntoChunks(text: string, size: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.substring(i, i + size));
  }
  return chunks;
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

export async function POST() {
  try {
    const mistral = new Mistral({
      apiKey: process.env.MISTRAL_API_KEY!,
    });

    // Récupérer tous les documents avec du texte
    const { data: documents, error } = await supabase
      .from("documents")
      .select("id, full_text")
      .not("full_text", "is", null)
      .eq("status", "traite");

    if (error) throw error;
    if (!documents || documents.length === 0) {
      return NextResponse.json({ message: "No documents to migrate" });
    }

    let migrated = 0;
    let failed = 0;

    for (const doc of documents) {
      try {
        // Supprimer les anciens chunks
        await supabase
          .from("document_chunks")
          .delete()
          .eq("document_id", doc.id);

        // Générer nouveaux embeddings
        const chunks = splitIntoChunks(doc.full_text!, 1000);
        const results: Array<{
          index: number;
          embedding: number[];
          content: string;
        }> = [];

        for (let i = 0; i < chunks.length; i++) {
          const result = await mistral.embeddings.create({
            model: "mistral-embed",
            inputs: [chunks[i]],
          });

          if (!result.data?.[0]?.embedding) {
            throw new Error(`No embedding returned for chunk ${i + 1}`);
          }

          results.push({
            index: i,
            embedding: result.data[0].embedding,
            content: chunks[i],
          });
        }

        // Insérer nouveaux chunks
        await asyncPool(2, results, async ({ index, embedding, content }) => {
          await supabase.from("document_chunks").insert({
            document_id: doc.id,
            content,
            embedding,
            chunk_index: index,
          });
        });

        migrated++;
      } catch (error) {
        console.error(`Failed to migrate document ${doc.id}:`, error);
        failed++;
      }
    }

    return NextResponse.json({
      message: `Migration completed: ${migrated} succeeded, ${failed} failed`,
      migrated,
      failed,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Migration failed", details: error },
      { status: 500 },
    );
  }
}
