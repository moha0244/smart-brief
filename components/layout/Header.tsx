// components/layout/Header.tsx
"use client";

import { SearchInput } from "@/components/ui/SearchInput";
import { Button } from "@/components/ui/Button";

interface HeaderProps {
  onUploadSuccess: () => void;
  documentCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function Header({
  onUploadSuccess,
  documentCount,
  searchQuery,
  onSearchChange,
}: HeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes documents</h1>
          <p className="text-gray-500 mt-1">
            {documentCount} document{documentCount !== 1 ? "s" : ""} dans votre
            bibliothèque
          </p>
        </div>
        <Button onUploadSuccess={onUploadSuccess} variant="primary">
          Nouveau document
        </Button>
      </div>

      <SearchInput
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Rechercher un document..."
        className="mb-6"
      />
    </div>
  );
}
