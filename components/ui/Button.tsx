// components/ui/Button.tsx
"use client";

import { ButtonProps } from "@/lib/types";
import { motion } from "framer-motion";
import { ReactNode } from "react";

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  className = "",
  onClick,
  type = "button",
  active = false,
}: ButtonProps) {
  const getVariantClasses = () => {
    if (active) {
      switch (variant) {
        case "secondary":
          return "bg-indigo-600 text-white border border-indigo-600 shadow-md shadow-indigo-200";
        case "danger":
          return "bg-red-600 text-white border border-red-600 shadow-md shadow-red-200";
        case "ghost":
          return "bg-indigo-100 text-indigo-700 border border-indigo-200";
        default: // primary
          return "bg-indigo-600 text-white border border-indigo-600 shadow-md shadow-indigo-200";
      }
    }

    switch (variant) {
      case "secondary":
        return "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300";
      case "danger":
        return "bg-red-600 text-white hover:bg-red-700";
      case "ghost":
        return "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
      default: // primary
        return "bg-indigo-600 text-white hover:bg-indigo-700";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-3 py-1.5 text-sm";
      case "lg":
        return "px-6 py-3 text-base";
      default: // md
        return "px-4 py-2 text-sm";
    }
  };

  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-medium rounded-xl transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${className}
  `;

  const renderIcon = () => {
    if (loading) {
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
        />
      );
    }
    return icon;
  };

  return (
    <motion.button
      type={type}
      className={baseClasses}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {icon && iconPosition === "left" && renderIcon()}
      {children}
      {icon && iconPosition === "right" && renderIcon()}
    </motion.button>
  );
}

interface IconButtonProps {
  icon: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
  tooltip?: string;
}

export function IconButton({
  icon,
  variant = "ghost",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  onClick,
  tooltip,
}: IconButtonProps) {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "p-1.5";
      case "lg":
        return "p-3";
      default: // md
        return "p-2";
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "secondary":
        return "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300";
      case "danger":
        return "bg-red-50 text-red-600 hover:bg-red-100";
      case "primary":
        return "bg-indigo-600 text-white hover:bg-indigo-700";
      default: // ghost
        return "text-gray-400 hover:text-gray-600 hover:bg-gray-100";
    }
  };

  const baseClasses = `
    rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${className}
  `;

  const button = (
    <motion.button
      className={baseClasses}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={{ scale: disabled || loading ? 1 : 1.1 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
        />
      ) : (
        icon
      )}
    </motion.button>
  );

  if (tooltip) {
    return (
      <div className="relative group">
        {button}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {tooltip}
        </div>
      </div>
    );
  }

  return button;
}
