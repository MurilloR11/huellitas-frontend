import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Send, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────────

type MessageSide = 'agent' | 'user';

interface Message {
  id: string;
  side: MessageSide;
  text: string;
  timestamp: string;
}

// ─── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    side: 'agent',
    text: '¡Hola! Soy del equipo Huellitas. Estoy aquí para ayudarte con cualquier duda sobre el proceso de adopción. ¿En qué te puedo ayudar hoy?',
    timestamp: '10:28 AM',
  },
  {
    id: '2',
    side: 'user',
    text: 'Hola, tengo una pregunta sobre el proceso de adopción para Luna.',
    timestamp: '10:30 AM',
  },
  {
    id: '3',
    side: 'agent',
    text: '¡Claro que sí! Luna es una gatita preciosa. ¿Qué dudas tienes sobre el proceso?',
    timestamp: '10:31 AM',
  },
  {
    id: '4',
    side: 'user',
    text: '¿Cuánto tiempo tarda la revisión de mi solicitud?',
    timestamp: '10:33 AM',
  },
  {
    id: '5',
    side: 'agent',
    text: 'Generalmente el proceso de revisión toma entre 3 y 5 días hábiles. Nuestro equipo evaluará tu perfil y te notificaremos por correo electrónico con el resultado tan pronto como esté listo.',
    timestamp: '10:34 AM',
  },
  {
    id: '6',
    side: 'user',
    text: '¿Puedo visitar al animal antes de que aprueben mi solicitud?',
    timestamp: '10:35 AM',
  },
  {
    id: '7',
    side: 'agent',
    text: '¡Por supuesto! De hecho lo recomendamos. Puedes agendar una visita de conocimiento desde la sección "Agendar encuentro" en el menú lateral, sin necesidad de tener la solicitud aprobada.',
    timestamp: '10:37 AM',
  },
  {
    id: '8',
    side: 'user',
    text: 'Perfecto, muchas gracias por la ayuda.',
    timestamp: '10:38 AM',
  },
];

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

// ─── Message thread ────────────────────────────────────────────────────────────

function MessageThread() {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, []);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-4 bg-stone-50 dark:bg-zinc-950">
      <DateSeparator label="Hoy" />
      {MOCK_MESSAGES.map(msg =>
        msg.side === 'agent' ? (
          <AgentBubble key={msg.id} message={msg} />
        ) : (
          <UserBubble key={msg.id} message={msg} />
        ),
      )}
      <div ref={bottomRef} />
    </div>
  );
}

// ─── Input bar ─────────────────────────────────────────────────────────────────

function InputBar() {
  const [value, setValue] = useState('');
  const hasText = value.trim().length > 0;

  return (
    <div className="shrink-0 flex items-center gap-3 px-5 py-3.5 bg-white dark:bg-zinc-900 border-t border-stone-200 dark:border-zinc-800">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Escribe un mensaje..."
        className="flex-1 text-sm bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-full px-4 py-2.5 text-stone-800 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-500 outline-none focus:border-stone-300 dark:focus:border-zinc-600 transition-colors"
      />
      <button
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-all',
          hasText
            ? 'text-white hover:opacity-90 active:scale-95 shadow-sm'
            : 'text-stone-300 dark:text-zinc-600 bg-stone-100 dark:bg-zinc-800',
        )}
        style={hasText ? { background: 'var(--color-brand)' } : {}}
        aria-label="Enviar mensaje"
      >
        <Send className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ChatHeader />
      <MessageThread />
      <InputBar />
    </div>
  );
}
