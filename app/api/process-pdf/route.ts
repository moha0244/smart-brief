import { supabase } from "@/lib/supabase-admin";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";

export async function POST(req: Request) {
  const { filePath, docId } = await req.json();
  

  try {
    //  Télécharger le fichier depuis le bucket "documents"
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("documents")
      .download(filePath);

    if (downloadError) throw downloadError;

    //  Extraire le texte du PDF
    const loader = new PDFLoader(fileData as Blob);
    const docs = await loader.load();

    //  Découper le texte en "chunks" (morceaux)
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitDocs = await splitter.splitDocuments(docs);

    //  Générer les embeddings et sauvegarder dans Supabase
    await SupabaseVectorStore.fromDocuments(
      splitDocs,
      new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
      {
        client: supabase,
        tableName: "documents",
      },
    );

    //  Mise à jour du statut en "traite"
    await supabase
      .from("documents")
      .update({ status: "traite" })
      .eq("id", docId);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Erreur traitement:", error);
    await supabase
      .from("documents")
      .update({ status: "erreur" })
      .eq("id", docId);
    return Response.json({ error: "Échec du traitement" }, { status: 500 });
  }
}
