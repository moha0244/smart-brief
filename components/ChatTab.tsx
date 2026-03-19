// components/ChatTab.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabase";
import { ConfirmDialog } from "./ConfirmDialog";
import { ConversationSidebar } from "./chat/ConversationSidebar";
import { MessageList } from "./chat/MessageList";
import { ChatInput } from "./chat/ChatInput";
import { FiMenu } from "react-icons/fi";

import {
  ChatTabProps,
  Message,
  Conversation,
  ChunkWithSimilarity,
  Source,
  DocumentChunk,
  DatabaseEmbedding,
} from "@/lib/types";

export function ChatTab({ documentId }: ChatTabProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    number | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newConversationTitle, setNewConversationTitle] = useState("");
  const [showNewConvInput, setShowNewConvInput] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<
    number | null
  >(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, [documentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select(
          `
          id,
          title,
          created_at,
          conversation_messages(count)
        `,
        )
        .eq("document_id", documentId)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      setConversations(data || []);

      if (!data || data.length === 0) {
        createNewConversation();
      } else {
        loadConversation(data[0].id);
      }
    } catch (error) {
      // Erreur
    }
  };

  const createNewConversation = async (
    title: string = "Nouvelle conversation",
  ) => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .insert({
          document_id: documentId,
          title: title,
        })
        .select()
        .single();

      if (error) throw error;

      setConversations((prev) => [data, ...prev]);
      loadConversation(data.id);
      setShowNewConvInput(false);
      setNewConversationTitle("");
    } catch (error) {
      // Erreur silencieuse
    }
  };

  const loadConversation = async (conversationId: number) => {
    setCurrentConversationId(conversationId);
    setMessages([]);

    try {
      const { data, error } = await supabase
        .from("conversation_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setMessages(
          data.map((msg) => ({
            role: msg.role,
            content: msg.content,
            sources: msg.sources,
          })),
        );
      } else {
        setMessages([
          {
            role: "assistant",
            content: "Bonjour ! Posez-moi des questions sur ce document.",
          },
        ]);
      }
    } catch (error) {
    }
  };

  //  ouvre le dialogue de confirmation
  const handleDeleteClick = (conversationId: number) => {
    setConversationToDelete(conversationId);
    setShowDeleteConfirm(true);
  };

  //  supprime après confirmation
  const handleConfirmDelete = async () => {
    if (!conversationToDelete) return;

    try {
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", conversationToDelete);

      if (error) throw error;

      setConversations((prev) =>
        prev.filter((c) => c.id !== conversationToDelete),
      );

      if (currentConversationId === conversationToDelete) {
        const nextConv = conversations.find(
          (c) => c.id !== conversationToDelete,
        );
        if (nextConv) {
          loadConversation(nextConv.id);
        } else {
          createNewConversation();
        }
      }
    } catch (error) {
    } finally {
      setShowDeleteConfirm(false);
      setConversationToDelete(null);
    }
  };
  const parseEmbedding = (emb: DatabaseEmbedding): number[] => {
    // Si c'est déjà un tableau
    if (Array.isArray(emb)) return emb;

    // Si c'est une string
    if (typeof emb === "string") {
      try {
        // Format: "[-0.001, 0.002, ...]"
        if (emb.startsWith("[") && emb.endsWith("]")) {
          return emb.slice(1, -1).split(",").map(Number);
        }
        // Format: "-0.001,-0.002,..."
        return emb.split(",").map(Number);
      } catch (e) {
        return [];
      }
    }

    // Si c'est un objet avec des clés numériques
    if (emb && typeof emb === "object") {
      return Object.values(emb);
    }

    return [];
  };

  const calculateSimilarityForChunk = (
    chunkEmbedding: number[],
    questionEmbedding: number[],
  ) => {
    // Vérifie que l'embedding est valide
    if (chunkEmbedding.length === 0) {
      return 0;
    }

    // Vérifie les longueurs
    if (chunkEmbedding.length !== questionEmbedding.length) {
      // Prendre la longueur minimale
      const minLength = Math.min(
        questionEmbedding.length,
        chunkEmbedding.length,
      );
      const qSlice = questionEmbedding.slice(0, minLength);
      const cSlice = chunkEmbedding.slice(0, minLength);

      return calculateCosineSimilarity(qSlice, cSlice);
    }

    return calculateCosineSimilarity(questionEmbedding, chunkEmbedding);
  };

  const processChunks = (
    allChunks: DocumentChunk[],
    questionEmbedding: number[],
  ): ChunkWithSimilarity[] => {
    return allChunks.map((chunk) => {
      const chunkEmbedding = parseEmbedding(chunk.embedding);

      if (chunkEmbedding.length === 0) {
        return {
          ...chunk,
          embedding: [], // Ensure it's number[]
          similarity: 0,
        };
      }

      const similarity = calculateSimilarityForChunk(
        chunkEmbedding,
        questionEmbedding,
      );

      return {
        ...chunk,
        embedding: chunkEmbedding, 
        similarity,
      };
    });
  };

  const findRelevantChunks = async (question: string) => {
    try {
      const genAI = new GoogleGenerativeAI(
        process.env.NEXT_PUBLIC_GEMINI_API_KEY!,
      );
      const embeddingModel = genAI.getGenerativeModel({
        model: "gemini-embedding-001",
      });

      const result = await embeddingModel.embedContent(question);
      const questionEmbedding = result.embedding.values;

      const { data: allChunks, error } = await supabase
        .from("document_chunks")
        .select("id, content, chunk_index, embedding")
        .eq("document_id", documentId);

      if (error) throw error;
      if (!allChunks || allChunks.length === 0) {
        return { chunks: [] };
      }


      const chunksWithSimilarity = processChunks(allChunks, questionEmbedding);

      // Filtrer les chunks avec similarité valide
      const validChunks = chunksWithSimilarity.filter(
        (c) => !isNaN(c.similarity) && c.similarity > 0,
      );

      if (validChunks.length === 0) {
        return { chunks: [] };
      }

      // Trier par similarité
      const sortedChunks = validChunks.sort(
        (a, b) => b.similarity - a.similarity,
      );


      // Prendre les 5 meilleurs chunks
      const topChunks = sortedChunks.slice(0, 5);

      return { chunks: topChunks };
    } catch (error) {
      return { chunks: [] };
    }
  };

  function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    try {
      if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) {
        return 0;
      }

      // assure qu'ils ont la même longueur
      const minLength = Math.min(vecA.length, vecB.length);
      const a = vecA.slice(0, minLength);
      const b = vecB.slice(0, minLength);

      const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
      const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
      const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

      if (normA === 0 || normB === 0) return 0;

      const similarity = dotProduct / (normA * normB);

      // Arrondir pour éviter les problèmes de précision
      return Number(Math.min(1, Math.max(0, similarity)).toFixed(4));
    } catch (error) {
      return 0;
    }
  }
  const prepareContext = async (question: string) => {
    const { chunks } = await findRelevantChunks(question);

    if (chunks && chunks.length > 0) {
      const context = chunks
        .map(
          (c: ChunkWithSimilarity) =>
            `[Extrait ${c.chunk_index + 1} (pertinence: ${(c.similarity * 100).toFixed(1)}%)]\n${c.content}`,
        )
        .join("\n\n");

      const sourcesList: Source[] = chunks.map((c: ChunkWithSimilarity) => ({
        page: c.chunk_index || 0,
        text: `Chunk ${c.chunk_index + 1}`,
        content: c.content.substring(0, 100) + "...",
        similarity: c.similarity,
      }));


      return { context, sourcesList };
    }

    const { data: doc } = await supabase
      .from("documents")
      .select("full_text")
      .eq("id", documentId)
      .single();

    if (doc?.full_text) {
      return {
        context: doc.full_text,
        sourcesList: [
          {
            page: 1,
            text: "Document complet",
            content: doc.full_text.substring(0, 100) + "...",
          },
        ],
      };
    }

    return { context: "", sourcesList: [] };
  };

  const callChatAPI = async (
    message: string,
    context: string,
    conversationId: number,
  ) => {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        context,
        conversationId,
        documentId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: { response: string } = await response.json();
    return data.response;
  };

  const saveMessages = async (
    conversationId: number,
    userMessage: string,
    assistantResponse: string,
    sourcesList: Source[],
  ) => {
    // Sauvegarde le message utilisateur
    await supabase.from("conversation_messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: userMessage,
    });

    // Sauvegarde la réponse de l'assistant
    await supabase.from("conversation_messages").insert({
      conversation_id: conversationId,
      role: "assistant",
      content: assistantResponse,
      sources: sourcesList,
    });

    // Met à jour la date de la conversation
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !currentConversationId) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      const { context, sourcesList } = await prepareContext(userMessage);
      const assistantResponse = await callChatAPI(
        userMessage,
        context,
        currentConversationId,
      );

      await saveMessages(
        currentConversationId,
        userMessage,
        assistantResponse,
        sourcesList,
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: assistantResponse,
          sources: sourcesList,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Désolé, une erreur s'est produite.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex h-[600px] border border-gray-200 rounded-xl bg-white overflow-hidden">
        <ConversationSidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          sidebarOpen={sidebarOpen}
          onConversationSelect={loadConversation}
          onConversationDelete={handleDeleteClick}
          onNewConversation={() => createNewConversation()}
          onSidebarToggle={() => setSidebarOpen(false)}
          newConversationTitle={newConversationTitle}
          onNewConversationTitleChange={setNewConversationTitle}
          showNewInput={showNewConvInput}
          onShowNewInputChange={setShowNewConvInput}
        />

        <div className="flex-1 flex flex-col">
          {!sidebarOpen && (
            <div className="p-2 border-b border-gray-200">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <FiMenu className="w-4 h-4" />
                Conversations
              </button>
            </div>
          )}

          <MessageList messages={messages} loading={loading} />
          <div ref={messagesEndRef} />

          <ChatInput
            input={input}
            onInputChange={setInput}
            onSend={handleSend}
            loading={loading}
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setConversationToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer la conversation ?"
        message="Cette action est irréversible. Tous les messages seront perdus."
        type="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </>
  );
}
