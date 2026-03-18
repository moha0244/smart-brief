// components/ui/LoadingSpinner.tsx
"use client";

import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "indigo" | "emerald" | "orange" | "red";
  className?: string;
}

export function LoadingSpinner({ 
  size = "md", 
  color = "indigo",
  className = ""
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-4",
    lg: "w-12 h-12 border-4"
  };

  const colorClasses = {
    indigo: "border-indigo-200 border-t-indigo-600",
    emerald: "border-emerald-200 border-t-emerald-600",
    orange: "border-orange-200 border-t-orange-600",
    red: "border-red-200 border-t-red-600"
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    />
  );
}

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingState({ 
  message = "Chargement...", 
  size = "md",
  className = ""
}: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <LoadingSpinner size={size} />
      {message && (
        <motion.p
          className="mt-4 text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}
