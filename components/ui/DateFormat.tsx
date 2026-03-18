// components/ui/DateFormat.tsx
"use client";

interface DateFormatProps {
  date: string;
  format?: "short" | "long" | "relative";
  className?: string;
}

export function DateFormat({ date, format = "short", className = "" }: DateFormatProps) {
  const formatDate = (dateString: string, formatType: string) => {
    const date = new Date(dateString);
    
    switch (formatType) {
      case "long":
        return date.toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      case "relative":
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return "Aujourd'hui";
        if (diffDays === 1) return "Hier";
        if (diffDays < 7) return `Il y a ${diffDays} jours`;
        if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
        return date.toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      default: // short
        return date.toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).replace(/\./g, "");
    }
  };

  return <span className={className}>{formatDate(date, format)}</span>;
}
