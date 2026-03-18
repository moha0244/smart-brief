// components/Header.tsx
"use client";

import { UploadButton } from "./upload/UploadButton";

interface HeaderProps {
  onUploadSuccess: () => void;
  documentCount: number;
}

export function Header({ onUploadSuccess, documentCount }: HeaderProps) {
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
        <UploadButton onUploadSuccess={onUploadSuccess} />
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher un document..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-11 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <svg
          className="w-5 h-5 text-gray-400 absolute left-4 top-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
  );
}
