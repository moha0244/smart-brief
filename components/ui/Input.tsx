// components/ui/Input.tsx
"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number" | "search";
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  className?: string;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  label,
  error,
  disabled = false,
  required = false,
  icon,
  iconPosition = "left",
  className = "",
  size = "md",
  fullWidth = true,
}: InputProps) {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-3 py-1.5 text-sm";
      case "lg":
        return "px-5 py-3 text-base";
      default: // md
        return "px-4 py-2.5 text-sm";
    }
  };

  const getPaddingClasses = () => {
    if (!icon) return "";
    const basePadding = iconPosition === "left" ? "pl-" : "pr-";
    switch (size) {
      case "sm":
        return `${basePadding}8`;
      case "lg":
        return `${basePadding}12`;
      default: // md
        return `${basePadding}10`;
    }
  };

  const baseClasses = `
    border rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error ? "border-red-500 focus:ring-red-500" : "border-gray-200"}
    ${getSizeClasses()}
    ${getPaddingClasses()}
    ${fullWidth ? "w-full" : ""}
    ${className}
  `;

  const renderInput = () => (
    <div className="relative">
      {icon && iconPosition === "left" && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}

      <motion.input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={baseClasses}
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      />

      {icon && iconPosition === "right" && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
    </div>
  );

  if (label) {
    return (
      <div className={`${fullWidth ? "w-full" : ""}`}>
        <label
          className={`block text-sm font-medium text-gray-700 mb-1 ${required ? "after:content-['*'] after:ml-1 after:text-red-500" : ""}`}
        >
          {label}
        </label>
        {renderInput()}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-red-600"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }

  return renderInput();
}

interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  className?: string;
  fullWidth?: boolean;
}

export function Textarea({
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  rows = 4,
  className = "",
  fullWidth = true,
}: TextareaProps) {
  const baseClasses = `
    border rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
    disabled:opacity-50 disabled:cursor-not-allowed resize-none
    ${error ? "border-red-500 focus:ring-red-500" : "border-gray-200"}
    px-4 py-2.5 text-sm
    ${fullWidth ? "w-full" : ""}
    ${className}
  `;

  const renderTextarea = () => (
    <motion.textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      rows={rows}
      className={baseClasses}
      whileFocus={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    />
  );

  if (label) {
    return (
      <div className={`${fullWidth ? "w-full" : ""}`}>
        <label
          className={`block text-sm font-medium text-gray-700 mb-1 ${required ? "after:content-['*'] after:ml-1 after:text-red-500" : ""}`}
        >
          {label}
        </label>
        {renderTextarea()}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-red-600"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }

  return renderTextarea();
}

// Select component
interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  className = "",
  fullWidth = true,
}: SelectProps) {
  const baseClasses = `
    border rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error ? "border-red-500 focus:ring-red-500" : "border-gray-200"}
    px-4 py-2.5 text-sm
    ${fullWidth ? "w-full" : ""}
    ${className}
  `;

  const renderSelect = () => (
    <motion.select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      required={required}
      className={baseClasses}
      whileFocus={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </motion.select>
  );

  if (label) {
    return (
      <div className={`${fullWidth ? "w-full" : ""}`}>
        <label
          className={`block text-sm font-medium text-gray-700 mb-1 ${required ? "after:content-['*'] after:ml-1 after:text-red-500" : ""}`}
        >
          {label}
        </label>
        {renderSelect()}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-red-600"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }

  return renderSelect();
}
