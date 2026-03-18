// components/ui/Card.tsx
"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  variant?: "default" | "elevated" | "outlined" | "ghost";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  variant = "default",
  padding = "md",
  className = "",
  hover = false,
  onClick,
}: CardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "elevated":
        return "bg-white shadow-lg border border-gray-100";
      case "outlined":
        return "bg-white border-2 border-gray-200";
      case "ghost":
        return "bg-transparent";
      default: // default
        return "bg-white shadow-sm border border-gray-100";
    }
  };

  const getPaddingClasses = () => {
    switch (padding) {
      case "none":
        return "";
      case "sm":
        return "p-4";
      case "lg":
        return "p-8";
      case "xl":
        return "p-10";
      default: // md
        return "p-6";
    }
  };

  const baseClasses = `
    rounded-2xl transition-all duration-200
    ${getVariantClasses()}
    ${getPaddingClasses()}
    ${hover ? "hover:shadow-xl hover:border-indigo-200 cursor-pointer" : ""}
    ${onClick ? "cursor-pointer" : ""}
    ${className}
  `;

  return (
    <motion.div
      className={baseClasses}
      onClick={onClick}
      whileHover={hover || onClick ? { scale: 1.02, y: -2 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={className}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  );
}
