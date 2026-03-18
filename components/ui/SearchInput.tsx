// components/ui/SearchInput.tsx
"use client";

import { motion } from "framer-motion";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showIcon?: boolean;
}

export function SearchInput({ 
  value, 
  onChange, 
  placeholder = "Rechercher un document...",
  className = "",
  showIcon = true
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <motion.input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border border-gray-200 rounded-lg px-4 py-2.5 ${showIcon ? 'pl-10' : ''} focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      />
      {showIcon && (
        <svg
          className="w-5 h-5 text-gray-400 absolute left-3 top-3"
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
      )}
    </div>
  );
}
