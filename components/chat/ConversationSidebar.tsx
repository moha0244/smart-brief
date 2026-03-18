// components/chat/ConversationSidebar.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiMessageSquare, FiTrash2 } from "react-icons/fi";
import { Button, IconButton } from "@/components/ui/Button";
import { ConversationSidebarProps, Conversation } from "@/lib/types";

export function ConversationSidebar({
  conversations,
  currentConversationId,
  sidebarOpen,
  onConversationSelect,
  onConversationDelete,
  onNewConversation,
  onSidebarToggle,
  newConversationTitle,
  onNewConversationTitleChange,
  showNewInput,
  onShowNewInputChange,
}: ConversationSidebarProps) {
  return (
    <AnimatePresence initial={false}>
      {sidebarOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 256, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className="border-r border-gray-200 bg-gray-50 flex flex-col overflow-hidden"
        >
          <div className="p-3 border-b border-gray-200">
            <Button
              onClick={() => onShowNewInputChange(true)}
              size="sm"
              className="w-full"
              icon={<FiMessageSquare className="w-4 h-4" />}
            >
              Nouvelle conversation
            </Button>

            <AnimatePresence>
              {showNewInput && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-2 overflow-hidden"
                >
                  <input
                    type="text"
                    value={newConversationTitle}
                    onChange={(e) =>
                      onNewConversationTitleChange(e.target.value)
                    }
                    placeholder="Titre (optionnel)"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-1"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <Button
                      onClick={() => onNewConversation()}
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                    >
                      Créer
                    </Button>
                    <Button
                      onClick={() => {
                        onShowNewInputChange(false);
                        onNewConversationTitleChange("");
                      }}
                      size="sm"
                      variant="ghost"
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={currentConversationId === conv.id}
                onSelect={() => onConversationSelect(conv.id)}
                onDelete={() => onConversationDelete(conv.id)}
              />
            ))}
          </div>

          <div className="p-3 border-t border-gray-200">
            <button
              onClick={onSidebarToggle}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              ← Réduire
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
}: ConversationItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`mb-1 p-2 rounded-lg cursor-pointer group ${
        isActive ? "bg-indigo-100" : "hover:bg-gray-200"
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate flex items-center gap-1">
            <FiMessageSquare className="w-3 h-3 text-gray-400" />
            {conversation.title}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(conversation.created_at).toLocaleDateString()}
          </p>
        </div>
        <IconButton
          icon={<FiTrash2 className="w-4 h-4" />}
          variant="danger"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 ml-2"
        />
      </div>
    </motion.div>
  );
}
