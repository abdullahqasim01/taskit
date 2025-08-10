import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { VSCodeApiType } from "../types";

// VS Code API
declare const acquireVsCodeApi: () => VSCodeApiType;

function useTextSync() {
  const [text, setText] = useState<string>(window.initialData?.text ?? "");
  const [vscodeApi] = useState(() => acquireVsCodeApi());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSentTextRef = useRef<string>(window.initialData?.text ?? "");
  const isUserTypingRef = useRef<boolean>(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      switch (message.type) {
        case "update":
          if (message.text !== lastSentTextRef.current && !isUserTypingRef.current) {
            setText(message.text);
            lastSentTextRef.current = message.text;
          }
          break;
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const setTextImmediate = useCallback((newText: string) => {
    isUserTypingRef.current = false;
    setText(newText);
    lastSentTextRef.current = newText;
    vscodeApi.postMessage({ type: "update", text: newText });
  }, [vscodeApi]);

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      isUserTypingRef.current = true;
      const cursorPosition = e.target.selectionStart;
      setText(newText);

      requestAnimationFrame(() => {
        if (textAreaRef.current) {
          textAreaRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }
      });

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        if (newText !== lastSentTextRef.current) {
          vscodeApi.postMessage({ type: "update", text: newText });
          lastSentTextRef.current = newText;
        }
        isUserTypingRef.current = false;
      }, 200);
    },
    [vscodeApi]
  );

  return { text, setTextImmediate, handleTextChange, textAreaRef, lastSentTextRef, isUserTypingRef } as const;
}

type TextContextValue = ReturnType<typeof useTextSync>;

const TextContext = createContext<TextContextValue | undefined>(undefined);

export const TextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useTextSync();
  return <TextContext.Provider value={value}>{children}</TextContext.Provider>;
};

export function useText() {
  const ctx = useContext(TextContext);
  if (!ctx) throw new Error("useText must be used within a TextProvider");
  return ctx;
}
