export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * Mock AI response stub.
 *
 * Replace with a real API call (e.g., Anthropic, OpenAI) in a future iteration.
 * The component imports only this function and the ChatMessage type, so swapping
 * this file for a real implementation requires no changes in the UI layer.
 */
export async function mockAIResponse(_messages: ChatMessage[]): Promise<string> {
  await new Promise<void>((resolve) => setTimeout(resolve, 1200));
  return 'This is a placeholder response. Connect a real AI provider here.';
}
