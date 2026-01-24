import { useEffect, useRef } from "react";
import { Paperclip, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  disabled?: boolean;
  isSending?: boolean;
  helperText?: string;
  onChange: (value: string) => void;
  onSend: () => void;
};

export default function ChatComposer({
  value,
  disabled,
  isSending,
  helperText,
  onChange,
  onSend,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isSendDisabled = Boolean(disabled || !value.trim() || isSending);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    const next = Math.min(el.scrollHeight, 120);
    el.style.height = `${next}px`;
  }, [value]);

  return (
    <div className="border-t border-slate-200/80 bg-white/95 px-4 py-4 backdrop-blur">
      <div
        className={cn(
          "flex items-end gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition",
          disabled ? "opacity-70" : "focus-within:ring-1 focus-within:ring-blue-200"
        )}
      >
        <Button variant="ghost" size="icon" className="text-slate-500" type="button" disabled>
          <Paperclip className="h-4 w-4" />
        </Button>

        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              if (isSendDisabled) return;
              onSend();
            }
          }}
          placeholder={disabled ? "Ticket closed or unassigned." : "Type your message"}
          disabled={disabled}
          rows={1}
          className="min-h-[44px] flex-1 resize-none border-0 bg-transparent px-0 text-sm text-slate-700 shadow-none focus-visible:ring-0"
        />

        <Button
          type="button"
          disabled={isSendDisabled}
          className="h-9 rounded-full px-4"
          onClick={onSend}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {helperText ? <p className="mt-2 text-xs text-amber-600">{helperText}</p> : null}
    </div>
  );
}
