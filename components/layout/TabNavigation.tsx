// components/layout/TabNavigation.tsx
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

interface TabNavigationProps {
  activeTab: "resume" | "flashcards" | "chat";
  onTabChange: (tab: "resume" | "flashcards" | "chat") => void;
}

const tabs = [
  { id: "resume", label: "Résumé" },
  { id: "flashcards", label: "Flashcards" },
  { id: "chat", label: "Chat" },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
      {tabs.map((tab) => (
        <motion.div
          key={tab.id}
          className="relative flex-1"
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => onTabChange(tab.id as any)}
            variant={activeTab === tab.id ? "primary" : "ghost"}
            size="sm"
            className={`w-full ${
              activeTab === tab.id
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </Button>
          
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-white rounded-xl -z-10 shadow-sm"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}
