// components/index.ts

// Export des composants UI de base
export * from './ui/Button';
export * from './ui/Input';
export * from './ui/Card';
export * from './ui/DateFormat';
export * from './ui/StatusIndicator';
export * from './ui/SearchInput';
export * from './ui/LoadingSpinner';
export * from './ui/ErrorState';
export * from './ui/MotionTransition';

// Export des composants d'upload
export * from './upload/UploadButton';
export * from './upload/UploadPopup';

// Export des composants de layout
export * from './layout/Header';
export * from './layout/TabNavigation';

// Export des composants de document
export * from './DocumentCard';
export * from './DocumentList';
export * from './document/DocumentFilters';
export * from './document/DocumentControls';
export * from './document/DocumentGrid';
export * from './document/DocumentHeader';
export * from './document/DocumentEmptyState';

// Export des sous-composants de chat
export * from './chat/ConversationSidebar';
export * from './chat/MessageList';
export * from './chat/ChatInput';

// Export des sous-composants de flashcard
export { FlashcardDisplay } from './flashcard/FlashcardDisplay';
export { FlashcardHeader } from './flashcard/FlashcardHeader';
export { FlashcardNavigation } from './flashcard/FlashcardNavigation';

// Export des sous-composants de résumé
export * from './resume/ResumeControls';
export * from './resume/ResumeSections';

// Export des composants principaux
export * from './ChatTab';
export * from './FlashCardTab';
export * from './ResumeTab';
export * from './ConfirmDialog';
export * from './ExportMenu';
export * from './SessionManager';
