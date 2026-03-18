// components/document/DocumentFilters.tsx
"use client";

import { motion } from "framer-motion";
import { Document } from "@/lib/types/common";

interface DocumentFiltersProps {
  documents: Document[];
  filterStatus: string;
  onFilterChange: (status: string) => void;
}

export function DocumentFilters({ 
  documents, 
  filterStatus, 
  onFilterChange 
}: DocumentFiltersProps) {
  const filters = [
    {
      key: "all",
      label: "Tous",
      count: documents.length,
      className: filterStatus === "all"
        ? "bg-indigo-600 text-white"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    },
    {
      key: "traite",
      label: "Traités",
      count: documents.filter((d) => d.status === "traite").length,
      className: filterStatus === "traite"
        ? "bg-emerald-600 text-white"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    },
    {
      key: "en cours",
      label: "En cours",
      count: documents.filter((d) => d.status === "en cours").length,
      className: filterStatus === "en cours"
        ? "bg-orange-500 text-white"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }
  ];

  return (
    <div className="flex items-center gap-3">
      {filters.map((filter) => (
        <motion.button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter.className}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {filter.label} ({filter.count})
        </motion.button>
      ))}
    </div>
  );
}
