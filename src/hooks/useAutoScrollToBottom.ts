import { useEffect } from "react";
import type React from "react";

export function useAutoScrollToBottom<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T | null>,
  deps: unknown[] = []
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}
