import { Mistral } from "@mistralai/mistralai";
import { supabase } from "./supabase-admin";

export const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY!,
});

export function splitIntoChunks(text: string, size: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.substring(i, i + size));
  }
  return chunks;
}

export async function asyncPool<T, R>(
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

export async function generateEmbeddings(chunks: string[]): Promise<Array<{
  index: number;
  embedding: number[];
  content: string;
}>> {
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
      embedding: result.data[0].embedding as number[],
      content: chunks[i],
    });
  }

  return results;
}

export async function generateEmbeddingsWithTimeout(chunks: string[], timeoutMs: number = 30000): Promise<Array<{
  index: number;
  embedding: number[];
  content: string;
}>> {
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
          () => reject(new Error(`Timeout chunk ${i + 1} après ${timeoutMs / 1000}s`)),
          timeoutMs,
        );
      });

      const result = await Promise.race([embeddingPromise, timeoutChunk]);

      if (!result.data?.[0]?.embedding) {
        throw new Error(`No embedding returned for chunk ${i + 1}`);
      }

      results.push({
        index: i,
        embedding: result.data[0].embedding as number[],
        content: chunks[i],
      });

    } catch (chunkError) {
      const errorMessage = chunkError instanceof Error ? chunkError.message : String(chunkError);
      throw new Error(`Embedding generation failed for chunk ${i + 1}: ${errorMessage}`);
    }
  }

  return results;
}

export async function insertDocumentChunks(docId: string, embeddings: Array<{
  index: number;
  embedding: number[];
  content: string;
}>): Promise<void> {
  await asyncPool(2, embeddings, async ({ index, embedding, content }) => {
    await supabase.from("document_chunks").insert({
      document_id: docId,
      content,
      embedding,
      chunk_index: index,
    });
  });
}

export async function insertDocumentChunksWithTimeout(docId: string, embeddings: Array<{
  index: number;
  embedding: number[];
  content: string;
}>, timeoutMs: number = 10000): Promise<void> {
  await asyncPool(2, embeddings, async ({ index, embedding, content }) => {
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
        timeoutMs,
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
}
