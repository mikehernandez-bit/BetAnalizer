"use client";

import * as React from "react";
import { Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/clipboard-formatters";
import { cn } from "@/lib/utils";

export interface CopyMatchButtonProps {
  getText?: () => string | Promise<string>;
  text?: string;
  label?: string;
  successLabel?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  title?: string;
  iconOnly?: boolean;
}

export function CopyMatchButton({
  getText,
  text,
  label = "Copiar info",
  successLabel = "¡Copiado!",
  variant = "outline",
  size = "sm",
  className,
  title = "Copiar toda la información y mercados al portapapeles",
  iconOnly = false,
}: CopyMatchButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading || copied) return;

    try {
      setLoading(true);
      const content = text !== undefined ? text : getText ? await Promise.resolve(getText()) : "";
      const ok = await copyToClipboard(content);
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Error al copiar al portapapeles:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleCopy}
      title={title}
      className={cn(
        "gap-1.5 transition-all",
        copied && "border-brand-green/40 bg-brand-green/10 text-brand-green-bright",
        className
      )}
    >
      {loading ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : copied ? (
        <Check className="size-3.5 text-brand-green-bright" />
      ) : (
        <Copy className="size-3.5" />
      )}
      {!iconOnly && (
        <span className="truncate">{copied ? successLabel : label}</span>
      )}
    </Button>
  );
}
