import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  emoji?: string | null;
  size?: number;
  className?: string;
};

const TWEMOJI_BASE = "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg";

const normalizeEmoji = (input?: string | null) => {
  if (!input) return "";
  const value = input.trim();
  if (!value) return "";

  // Handle forms like "u2728", "\\u2728", "0x2728"
  const simpleMatch = value.match(/^(?:\\u|u|0x)([0-9a-fA-F]{4,6})$/);
  if (simpleMatch?.[1]) {
    return String.fromCodePoint(parseInt(simpleMatch[1], 16));
  }

  // Handle multi-codepoint forms like "1f1fa-1f1f8"
  if (/^[0-9a-fA-F]{4,6}(-[0-9a-fA-F]{4,6})+$/.test(value)) {
    return value
      .split("-")
      .map((part) => String.fromCodePoint(parseInt(part, 16)))
      .join("");
  }

  return value;
};

const toCodePoint = (emoji: string) =>
  Array.from(emoji)
    .map((symbol) => symbol.codePointAt(0)?.toString(16))
    .filter(Boolean)
    .join("-");

export function getTwemojiUrl(emoji: string) {
  const normalized = normalizeEmoji(emoji);
  if (!normalized) return "";
  const code = toCodePoint(normalized);
  if (!code) return "";
  return `${TWEMOJI_BASE}/${code}.svg`;
}

export default function EmojiIcon({ emoji, size = 16, className }: Props) {
  const normalized = normalizeEmoji(emoji);
  if (!normalized) return null;
  const [hasError, setHasError] = useState(false);
  const src = getTwemojiUrl(normalized);
  if (!src || hasError) {
    return (
      <span
        className={className}
        style={{ fontSize: `${size}px`, lineHeight: 1 }}
      >
        {normalized}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={normalized}
      width={size}
      height={size}
      loading="lazy"
      className={cn("inline-block align-middle", className)}
      onError={() => setHasError(true)}
    />
  );
}
