// lib/types/common.ts

export interface Document {
  id: string;
  uuid: string;
  title: string;
  created_at: string;
  pages: number;
  status: "traite" | "en cours" | "erreur";
  full_text?: string;
  file_path?: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: { page: number; text: string; content?: string }[];
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  message_count?: number;
}

export interface Flashcard {
  page: number;
  question: string;
  answer: string;
}

export interface ResumeData {
  overview: string;
  keyPoints: string[];
  definitions?: Array<{ term: string; definition: string }>;
  takeaways?: string[];
}

// Types pour les embeddings
export type VectorEmbedding = number[];
export type SerializedEmbedding = string; // Format: "[-0.001, 0.002, ...]" ou "-0.001,-0.002,..."
export type DatabaseEmbedding = VectorEmbedding | SerializedEmbedding;

export interface DocumentChunk {
  id: string;
  content: string;
  chunk_index: number;
  embedding: DatabaseEmbedding;
}

export interface ChunkWithSimilarity extends DocumentChunk {
  embedding: number[];
  similarity: number;
}

export interface Source {
  page: number;
  text: string;
  content?: string;
}

// Types pour les états de chargement
export interface LoadingState {
  loading: boolean;
  error: string | null;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

// Types pour les filtres
export interface DocumentFilters {
  status?: string;
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Types pour les erreurs
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, string | number | boolean>;
}

// Types pour les métadonnées
export interface DocumentMetadata {
  [key: string]: string | number | boolean;
}

// Types pour les exports
export type ExportFormat = "json" | "csv" | "txt" | "pdf";

export interface ExportOptions<T = ResumeData & { flashcards?: Flashcard[] }> {
  format: ExportFormat;
  filename: string;
  data: T;
}
