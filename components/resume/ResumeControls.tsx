// components/resume/ResumeControls.tsx
"use client";

import { motion } from "framer-motion";
import { FiFileText, FiList, FiBook, FiRefreshCw } from "react-icons/fi";
import { IconButton } from "@/components/ui/Button";
import { ExportMenu } from "@/components/ExportMenu";

import { ResumeControlsProps } from "@/lib/types";

export function ResumeControls({
  resumeLength,
  onLengthChange,
  onRegenerate,
  documentId,
  resume,
}: ResumeControlsProps) {
  const lengthOptions = [
    { value: "court", icon: FiFileText, label: "Court" },
    { value: "moyen", icon: FiList, label: "Moyen" },
    { value: "approfondi", icon: FiBook, label: "Approfondi" },
  ];

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {lengthOptions.map((option) => {
          const isActive = resumeLength === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onLengthChange(option.value as "court" | "moyen" | "approfondi")}
              className={`
                relative flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm
                transition-all duration-200 ease-in-out
                ${isActive 
                  ? "bg-white text-indigo-600 shadow-md transform scale-105" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }
              `}
            >
              <option.icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-gray-500"}`} />
              <span>{option.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white rounded-lg shadow-md -z-10"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <div className="text-sm text-gray-500 mr-2">
          {resumeLength === "court" && "≈ 100 mots"}
          {resumeLength === "moyen" && "≈ 300 mots"}
          {resumeLength === "approfondi" && "≈ 500+ mots"}
        </div>
        
        <IconButton
          icon={<FiRefreshCw className="w-5 h-5" />}
          onClick={onRegenerate}
          tooltip="Régénérer le résumé"
        />

        <ExportMenu
          data={resume}
          filename={`resume-${documentId}-${resumeLength}`}
          formats={["json", "txt"]}
          buttonClassName="text-gray-400 hover:text-indigo-600"
        />
      </div>
    </div>
  );
}
