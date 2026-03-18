// lib/types/index.ts

export * from "./common";
export * from "./components";

export interface AppState {
  user: {
    sessionToken: string | null;
  };
  documents: {
    list: Document[];
    loading: boolean;
    error: string | null;
  };
  ui: {
    sidebarOpen: boolean;
    theme: "light" | "dark";
  };
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Types pour les hooks
export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseLocalStorageResult<T> {
  value: T;
  setValue: (value: T) => void;
  removeValue: () => void;
}

// Types pour les utilitaires
export interface SortOption {
  key: string;
  label: string;
  direction: "asc" | "desc";
}

export interface FilterOption {
  key: string;
  label: string;
  value: string | number | boolean;
}

// Types pour les événements
export interface DocumentEvent {
  type: "upload" | "delete" | "update";
  documentId: string;
  timestamp: string;
  userId?: string;
}

export interface UserEvent {
  type: "login" | "logout" | "session_start";
  timestamp: string;
  sessionId?: string;
}

// Types pour la configuration
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
  };
  features: {
    chat: boolean;
    flashcards: boolean;
    export: boolean;
  };
  ui: {
    theme: "light" | "dark" | "auto";
    language: "fr" | "en";
  };
}

// Import des types communs pour éviter les références circulaires
import type { Document } from "./common";
