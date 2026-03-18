// components/TabNavigation.tsx
"use client";

import { motion } from "framer-motion";
import { FiFileText, FiBookOpen, FiMessageCircle } from "react-icons/fi";

interface TabNavigationProps {
  activeTab: "resume" | "flashcards" | "chat";
  onTabChange: (tab: "resume" | "flashcards" | "chat") => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    {
      id: "resume",
      label: "Résumé",
      icon: FiFileText,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      id: "flashcards",
      label: "Flashcards",
      icon: FiBookOpen,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      id: "chat",
      label: "Chat avec le PDF",
      icon: FiMessageCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="border-b border-gray-200 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex gap-1 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id as any)}
              className={`
                relative flex items-center gap-2 px-6 py-3 rounded-t-xl font-medium
                transition-all duration-200 overflow-hidden
                ${
                  isActive
                    ? "text-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-t from-indigo-50/50 to-transparent"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              <motion.div
                className="relative flex items-center gap-2"
                animate={{
                  scale: isActive ? 1.05 : 1,
                  y: isActive ? -1 : 0,
                }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.div
                  animate={{
                    rotate: isActive ? [0, -5, 5, 0] : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className={`p-1 rounded-lg transition-colors ${
                    isActive ? tab.bgColor : "bg-transparent"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? tab.color : "text-gray-400"}`}
                  />
                </motion.div>

                <span className="text-sm">{tab.label}</span>
              </motion.div>

              {isActive && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                  layoutId="activeIndicator"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
