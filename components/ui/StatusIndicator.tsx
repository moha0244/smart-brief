// components/ui/StatusIndicator.tsx
"use client";

import { StatusIndicatorProps } from "@/lib/types";
import { motion } from "framer-motion";
import { FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";

export function StatusIndicator({
  status,
  size = "md",
  showLabel = true,
  className = "",
}: StatusIndicatorProps) {
  const statusConfig = {
    traite: {
      icon: FiCheckCircle,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      label: "Traité",
    },
    "en cours": {
      icon: FiClock,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      label: "En cours",
    },
    erreur: {
      icon: FiAlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      label: "Erreur",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: {
      container: "px-2 py-1 gap-1",
      icon: "w-3 h-3",
      text: "text-xs",
    },
    md: {
      container: "px-3 py-1.5 gap-1.5",
      icon: "w-4 h-4",
      text: "text-sm",
    },
    lg: {
      container: "px-4 py-2 gap-2",
      icon: "w-5 h-5",
      text: "text-base",
    },
  };

  return (
    <motion.div
      className={`
        inline-flex items-center rounded-full border
        ${config.bgColor} ${config.borderColor}
        ${sizeClasses[size].container}
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      animate={{
        scale: [1, 1.02, 1],
      }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <Icon className={`${config.color} ${sizeClasses[size].icon}`} />
      {showLabel && (
        <span
          className={`font-medium ${config.color} ${sizeClasses[size].text}`}
        >
          {config.label}
        </span>
      )}
    </motion.div>
  );
}
