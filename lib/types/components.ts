// lib/types/components.ts

import { ReactNode } from "react";
import { Document, Conversation, Message, Flashcard, ResumeData } from "./common";

// Types pour les composants UI
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

export interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  active?: boolean;
}

export interface IconButtonProps extends BaseComponentProps {
  icon: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  tooltip?: string;
}

export interface InputProps extends BaseComponentProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number" | "search";
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export interface TextareaProps extends BaseComponentProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  fullWidth?: boolean;
}

export interface SelectProps extends BaseComponentProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
}

export interface CardProps extends BaseComponentProps {
  variant?: "default" | "elevated" | "outlined" | "ghost";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  hover?: boolean;
  onClick?: () => void;
}

export interface StatusIndicatorProps extends BaseComponentProps {
  status: "traite" | "en cours" | "erreur";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export interface DateFormatProps extends BaseComponentProps {
  date: string;
  format?: "short" | "long" | "relative";
}

export interface LoadingSpinnerProps extends BaseComponentProps {
  size?: "sm" | "md" | "lg";
  color?: "indigo" | "emerald" | "orange" | "red";
}

export interface LoadingStateProps extends BaseComponentProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export interface ErrorStateProps extends BaseComponentProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

export interface MotionTransitionProps extends BaseComponentProps {
  type?: "fade" | "slide" | "scale" | "bounce";
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
  delay?: number;
}

export interface SearchInputProps extends BaseComponentProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showIcon?: boolean;
}

// Types pour les composants de chat
export interface ChatTabProps {
  documentId: string;
}

export interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversationId: number | null;
  sidebarOpen: boolean;
  onConversationSelect: (id: number) => void;
  onConversationDelete: (id: number) => void;
  onNewConversation: () => void;
  onSidebarToggle: () => void;
  newConversationTitle: string;
  onNewConversationTitleChange: (title: string) => void;
  showNewInput: boolean;
  onShowNewInputChange: (show: boolean) => void;
}

export interface MessageListProps {
  messages: Message[];
  loading: boolean;
}

export interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: (e: React.FormEvent) => void;
  loading: boolean;
}

// Types pour les composants de flashcard
export interface FlashcardTabProps {
  documentId: string;
  documentContent?: string;
}

export interface FlashcardDisplayProps {
  flashcard: Flashcard;
  showAnswer: boolean;
  onToggle: () => void;
}

export interface FlashcardControlsProps {
  currentIndex: number;
  totalCards: number;
  onPrevious: () => void;
  onNext: () => void;
  onShuffle: () => void;
  onRegenerate: () => void;
  documentId: string;
  flashcards: Flashcard[];
}

// Types pour les composants de résumé
export interface ResumeTabProps {
  documentId: string;
  documentContent?: string;
}

export interface ResumeControlsProps {
  resumeLength: "court" | "moyen" | "approfondi";
  onLengthChange: (length: "court" | "moyen" | "approfondi") => void;
  onRegenerate: () => void;
  documentId: string;
  resume: ResumeData;
}

export interface ResumeSectionsProps {
  resume: ResumeData;
  resumeLength: "court" | "moyen" | "approfondi";
}

export interface DocumentListProps {
  refreshKey?: number;
  searchQuery?: string;
  onCountChange?: (count: number) => void;
  sessionToken?: string | null;
}

export interface DocumentCardProps {
  id: string;
  uuid: string;
  title: string;
  date: string;
  pages: number;
  status: "traite" | "en cours" | "erreur";
  onDelete?: () => void;
  onDeleteClick?: (
    id: string,
    title: string,
    pages: number,
    date: string,
  ) => void;
}

// UI Components Props
export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export interface MotionTransitionProps {
  children: ReactNode;
  type?: "fade" | "slide" | "scale" | "bounce";
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
  delay?: number;
  className?: string;
}

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "indigo" | "emerald" | "orange" | "red";
  className?: string;
}

export interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}

export interface DateFormatProps {
  date: string;
  format?: "short" | "long" | "relative";
  className?: string;
}

export interface CardProps {
  children: ReactNode;
  variant?: "default" | "elevated" | "outlined" | "ghost";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  className?: string;
  onClick?: () => void;
}

export interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export interface TabNavigationProps {
  activeTab: "resume" | "flashcards" | "chat";
  onTabChange: (tab: "resume" | "flashcards" | "chat") => void;
  className?: string;
}

export interface HeaderProps {
  onUploadSuccess: () => void;
  documentCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  className?: string;
}

export interface UploadButtonProps {
  onUploadSuccess: () => void;
  className?: string;
}

export interface UploadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  className?: string;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  className?: string;
}

export interface MessageBubbleProps {
  message: import("./common").Message;
  className?: string;
}

export interface ConversationItemProps {
  conversation: import("./common").Conversation;
  isActive: boolean;
  onSelect: () => void;
  className?: string;
}

export interface FlashcardHeaderProps {
  currentIndex: number;
  totalCards: number;
  onShuffle: () => void;
  onRegenerate: () => void;
  documentId: string;
  flashcards: import("./common").Flashcard[];
  className?: string;
}

export interface FlashcardNavigationProps {
  currentIndex: number;
  totalCards: number;
  onPrevious: () => void;
  onNext: () => void;
  progress: number;
  className?: string;
}

// Types pour les popups et formulaires
export interface UploadPopupDetails {
  fileName?: string;
  pages?: number;
  extractionMethod?: string;
}

export interface UploadPopupState {
  isOpen: boolean;
  type: "success" | "warning" | "error" | "processing";
  title: string;
  message: string;
  details?: UploadPopupDetails;
}

export interface ConfirmDialogItem {
  label: string;
  value: string;
}

// Types pour les composants de document
export interface DocumentFiltersProps {
  documents: Document[];
  filterStatus: string;
  onFilterChange: (status: string) => void;
}

export interface DocumentControlsProps {
  documentsCount: number;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onDeleteAll: () => void;
  isDeletingAll: boolean;
}

export interface DocumentGridProps {
  documents: Document[];
  viewMode: "grid" | "list";
  onDelete: () => void;
  onDeleteClick: (id: string, title: string, pages: number, date: string) => void;
}

export interface DocumentHeaderProps {
  sessionToken: string;
}

export interface DocumentEmptyStateProps {
  searchQuery?: string;
}

export interface DocumentToDelete {
  id: string;
  title: string;
  pages: number;
  date: string;
}
