import { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Bot, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../shared/constants/routes';
import { sendMessage as fetchAIReply } from '../../../services/aiService';
import type { ChatMessage } from '../../../services/aiService';

const MAX_CHARS = 1000;

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-zinc-200 shrink-0">
        <Bot className="w-3.5 h-3.5 text-zinc-500" />
      </div>
      <div className="flex items-center gap-1.5 bg-zinc-100 border border-zinc-200/60 text-zinc-800 rounded-2xl rounded-bl-sm px-4 py-3">
        <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" />
      </div>
    </div>
  );
}

export default function AIPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorSnapshot, setErrorSnapshot] = useState<ChatMessage[] | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  function adjustTextareaHeight() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(Math.min(el.scrollHeight, 120), 40)}px`;
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (e.target.value.length > MAX_CHARS) return;
    setInput(e.target.value);
    adjustTextareaHeight();
  }

  function resetTextarea() {
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = '40px';
  }

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setErrorSnapshot(null);
    resetTextarea();
    setIsLoading(true);

    try {
      const text = await fetchAIReply(updatedMessages);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: text,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setErrorSnapshot(updatedMessages);
    } finally {
      setIsLoading(false);
    }
  }

  async function retryLastMessage() {
    if (!errorSnapshot || isLoading) return;

    const snapshot = errorSnapshot;
    setMessages(snapshot);
    setErrorSnapshot(null);
    setIsLoading(true);

    try {
      const text = await fetchAIReply(snapshot);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: text,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setErrorSnapshot(snapshot);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const charsLeft = MAX_CHARS - input.length;
  const isNearLimit = charsLeft <= 100;

  return (
    <div className="flex flex-col h-screen bg-white">

      {/* ── HEADER ── */}
      <header className="shrink-0 flex items-center gap-3 h-14 px-4 sm:px-6 border-b border-zinc-200 bg-white z-10">
        <Link
          to={ROUTES.HOME}
          className="flex items-center justify-center w-11 h-11 rounded-lg text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 transition"
          aria-label="Volver al inicio"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand/10">
            <Bot className="w-4 h-4 text-brand" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-900 leading-none">
              AI Assistant
            </h1>
            <p className="text-[10px] text-zinc-400 mt-0.5 leading-none">
              Huellitas AI · Demo
            </p>
          </div>
        </div>
      </header>

      {/* ── MESSAGE THREAD ── */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Conversation"
        className="flex-1 overflow-y-auto flex flex-col px-4 sm:px-6"
      >
        {/* Empty state */}
        {messages.length === 0 && !isLoading && !errorSnapshot && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center select-none py-10">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-brand/10">
              <Bot className="w-7 h-7 text-brand" />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-zinc-800">
                ¿En qué puedo ayudarte hoy?
              </p>
              <p className="text-xs text-zinc-400 max-w-[220px] leading-relaxed">
                Pregunta sobre adopciones, fundaciones o cualquier tema de Huellitas.
              </p>
            </div>
          </div>
        )}

        {/* Messages */}
        {(messages.length > 0 || isLoading || errorSnapshot) && (
          <div className="py-5 space-y-5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-zinc-200 shrink-0 mb-[18px]">
                    <Bot className="w-3.5 h-3.5 text-zinc-500" />
                  </div>
                )}

                <div
                  className={`flex flex-col gap-1 max-w-[78%] ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={[
                      'px-4 py-2.5 text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'message--user bg-brand text-white rounded-2xl rounded-br-sm'
                        : 'message--assistant bg-zinc-100 border border-zinc-200/60 text-zinc-800 rounded-2xl rounded-bl-sm',
                    ].join(' ')}
                  >
                    {msg.content}
                  </div>
                  <time
                    dateTime={msg.timestamp.toISOString()}
                    className="text-[10px] text-zinc-400 px-1"
                  >
                    {formatTime(msg.timestamp)}
                  </time>
                </div>
              </div>
            ))}

            {isLoading && <TypingIndicator />}

            {errorSnapshot && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-red-700">
                    No se pudo obtener una respuesta
                  </p>
                  <p className="text-xs text-red-500 mt-0.5">
                    Algo salió mal. ¿Intentamos de nuevo?
                  </p>
                </div>
                <button
                  type="button"
                  onClick={retryLastMessage}
                  className="flex items-center gap-1.5 shrink-0 min-w-[44px] min-h-[44px] px-2 text-xs font-medium text-red-600 hover:text-red-700 transition"
                  aria-label="Reintentar último mensaje"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reintentar
                </button>
              </div>
            )}

            <div ref={bottomRef} aria-hidden="true" />
          </div>
        )}
      </div>

      {/* ── INPUT BAR ── */}
      <div className="shrink-0 bg-white border-t border-zinc-200 px-4 sm:px-6 py-2">
        <div className="flex items-end gap-2 rounded-xl border border-zinc-300 bg-zinc-50 pl-4 pr-2 py-1 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/30 transition">
          <label htmlFor="message-input" className="sr-only">
            Escribe tu mensaje
          </label>
          <textarea
            ref={textareaRef}
            id="message-input"
            rows={1}
            style={{ height: '40px' }}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Escribe un mensaje…"
            className="flex-1 min-h-[40px] max-h-[120px] resize-none overflow-y-auto bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none disabled:opacity-50 leading-[1.5]"
          />
          <div className="flex items-center gap-2 shrink-0 self-end pb-1">
            {isNearLimit && (
              <span
                className={`text-[10px] tabular-nums ${
                  charsLeft <= 50 ? 'text-red-500' : 'text-zinc-400'
                }`}
                aria-live="polite"
              >
                {charsLeft}
              </span>
            )}
            <button
              type="button"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              aria-label="Enviar mensaje"
              className="flex items-center justify-center w-11 h-11 rounded-lg bg-brand text-white hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-zinc-400 text-center mt-1.5">
          <kbd className="font-mono">Enter</kbd> para enviar ·{' '}
          <kbd className="font-mono">Shift + Enter</kbd> para nueva línea
        </p>
      </div>

    </div>
  );
}
