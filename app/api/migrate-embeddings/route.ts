import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-admin";
import { splitIntoChunks, generateEmbeddings, insertDocumentChunks } from "@/lib/embeddings";

export async function POST() {
  try {
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
        const results = await generateEmbeddings(chunks);

        // Insérer nouveaux chunks
        await insertDocumentChunks(doc.id, results);

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
