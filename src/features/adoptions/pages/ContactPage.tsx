import { useState, useRef, useEffect, useCallback } from 'react';
import { MoreHorizontal, Send, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sendMessage } from '../../../services/aiService';
import type { ChatMessage } from '../../../services/aiService';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  side: 'agent' | 'user';
  text: string;
  timestamp: string;
}

function toTimestamp(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function toChatMessages(messages: Message[]): ChatMessage[] {
  return messages.map((m) => ({
    id: m.id,
    role: m.side === 'agent' ? 'assistant' : 'user',
    content: m.text,
    timestamp: new Date(),
  }));
}

const INITIAL_MESSAGE: Message = {
  id: '0',
  side: 'agent',
  text: '¡Hola! Soy el asistente virtual de Huellitas. Estoy aquí para ayudarte con cualquier duda sobre el proceso de adopción. ¿En qué te puedo ayudar hoy?',
  timestamp: toTimestamp(new Date()),
};

// ─── Double checkmark ──────────────────────────────────────────────────────────

function DoubleCheck() {
  return (
    <span className="flex items-center" style={{ color: 'var(--color-brand)' }}>
      <Check className="w-3 h-3" strokeWidth={2.5} />
      <Check className="w-3 h-3 -ml-1.5" strokeWidth={2.5} />
    </span>
  );
}

// ─── Chat header ───────────────────────────────────────────────────────────────

function ChatHeader() {
  return (
    <div className="shrink-0 flex items-center justify-between px-5 py-3.5 bg-white dark:bg-zinc-900 border-b border-stone-200 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
          style={{ background: 'var(--color-brand)' }}
        >
          EH
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100 leading-tight">
            Equipo Huellitas
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              En línea
            </span>
          </div>
        </div>
      </div>
      <button
        className="flex items-center justify-center w-8 h-8 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
        aria-label="Opciones"
      >
        <MoreHorizontal className="w-5 h-5" strokeWidth={2} />
      </button>
    </div>
  );
}

// ─── Date separator ────────────────────────────────────────────────────────────

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-1">
      <span className="px-3 py-1 rounded-full bg-stone-200 dark:bg-zinc-800 text-[11px] font-medium text-stone-500 dark:text-zinc-400">
        {label}
      </span>
    </div>
  );
}

// ─── Agent bubble ──────────────────────────────────────────────────────────────

function AgentBubble({ message }: { message: Message }) {
  return (
    <div className="flex items-end gap-2.5">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
        style={{ background: 'var(--color-brand)' }}
      >
        EH
      </div>
      <div className="max-w-[72%]">
        <div className="bg-stone-100 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 text-sm px-4 py-2.5 rounded-2xl rounded-bl-sm leading-relaxed">
          {message.text}
        </div>
        <p className="text-[11px] text-stone-400 dark:text-zinc-500 mt-1 ml-1">
          {message.timestamp}
        </p>
      </div>
    </div>
  );
}

// ─── User bubble ───────────────────────────────────────────────────────────────

function UserBubble({ message }: { message: Message }) {
  return (
    <div className="flex flex-col items-end">
      <div
        className="max-w-[72%] text-white text-sm px-4 py-2.5 rounded-2xl rounded-br-sm leading-relaxed"
        style={{ background: 'var(--color-brand)' }}
      >
        {message.text}
      </div>
      <div className="flex items-center gap-1 mt-1 mr-1">
        <p className="text-[11px] text-stone-400 dark:text-zinc-500">{message.timestamp}</p>
        <DoubleCheck />
      </div>
    </div>
  );
}

// ─── Typing indicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
        style={{ background: 'var(--color-brand)' }}
      >
        EH
      </div>
      <div className="bg-stone-100 dark:bg-zinc-800 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce" />
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      side: 'user',
      text,
      timestamp: toTimestamp(new Date()),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await sendMessage(toChatMessages(updatedMessages));
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          side: 'agent',
          text: reply,
          timestamp: toTimestamp(new Date()),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          side: 'agent',
          text: 'Lo siento, tuve un problema al procesar tu mensaje. ¿Puedes intentarlo de nuevo?',
          timestamp: toTimestamp(new Date()),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSend();
  }

  const hasText = input.trim().length > 0;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ChatHeader />

      {/* Message thread */}
      <div
        role="log"
        aria-live="polite"
        className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-4 bg-stone-50 dark:bg-zinc-950"
      >
        <DateSeparator label="Hoy" />
        {messages.map((msg) =>
          msg.side === 'agent' ? (
            <AgentBubble key={msg.id} message={msg} />
          ) : (
            <UserBubble key={msg.id} message={msg} />
          ),
        )}
        {isLoading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="shrink-0 flex items-center gap-3 px-5 py-3.5 bg-white dark:bg-zinc-900 border-t border-stone-200 dark:border-zinc-800">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Escribe un mensaje..."
          className="flex-1 text-sm bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-full px-4 py-2.5 text-stone-800 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-500 outline-none focus:border-stone-300 dark:focus:border-zinc-600 transition-colors disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!hasText || isLoading}
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-all',
            hasText && !isLoading
              ? 'text-white hover:opacity-90 active:scale-95 shadow-sm'
              : 'text-stone-300 dark:text-zinc-600 bg-stone-100 dark:bg-zinc-800',
          )}
          style={hasText && !isLoading ? { background: 'var(--color-brand)' } : {}}
          aria-label="Enviar mensaje"
        >
          <Send className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
