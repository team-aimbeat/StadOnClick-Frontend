import { Button } from "@/components/ui/button";
import { Paperclip, Send, Smile } from "lucide-react";
import React from "react";

type ChatComposerProps = {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

export function ChatComposer({ value, onChange, onSend, disabled }: ChatComposerProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white px-4 py-3">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <div className="relative rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 shadow-inner">
            <textarea
              className="h-12 w-full resize-none bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              placeholder="Type a message. Press Enter to send, Shift+Enter for a new line."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Message input"
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1 text-slate-500">
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-slate-500 hover:text-slate-800"
                aria-label="Add attachment"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-slate-500 hover:text-slate-800"
                aria-label="Add emoji"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <Button
          className="gap-2 bg-[#0b59a2] hover:bg-[#094477]"
          aria-label="Send message"
          disabled={disabled || !value.trim()}
          onClick={onSend}
        >
          Send
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default ChatComposer;
