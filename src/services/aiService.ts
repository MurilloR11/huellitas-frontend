import axios from 'axios';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const aiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 120_000,
});

export async function sendMessage(messages: ChatMessage[]): Promise<string> {
  const payload = messages.map(({ role, content }) => ({ role, content }));
  const { data } = await aiClient.post<{ response: string }>('/ai/chat', { messages: payload });
  return data.response;
}
