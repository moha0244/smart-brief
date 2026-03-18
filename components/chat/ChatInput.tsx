// components/chat/ChatInput.tsx
"use client";

import { FiSend } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import { ChatInputProps } from "@/lib/types";

export function ChatInput({
  input,
  onInputChange,
  onSend,
  loading,
}: ChatInputProps) {
  return (
    <div className="border-t border-gray-200 p-4">
      <form onSubmit={onSend} className="flex gap-2">
        <Input
          value={input}
          onChange={onInputChange}
          placeholder="Posez votre question..."
          disabled={loading}
          className="flex-1 min-w-[720px]"
        />
        <Button
          type="submit"
          disabled={!input.trim() || loading}
          loading={loading}
          icon={<FiSend className="w-4 h-4" />}
          iconPosition="left"
        >
          {loading ? "..." : "Envoyer"}
        </Button>
      </form>
    </div>
  );
}
