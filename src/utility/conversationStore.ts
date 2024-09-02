"use server";

export type ChatMessage = {
  message: string;
  type: "user" | "assistant";
};

interface ConversationStore {
  get(sessionId: string): Promise<ChatMessage[]>;
  add(message: ChatMessage, sessionId: string): Promise<void>;
}

class MemoryStore implements ConversationStore {
  #cache = new Map<string, ChatMessage[]>();

  async add(message: ChatMessage, sessionId: string): Promise<void> {
    if (this.#cache.has(sessionId)) {
      this.#cache.get(sessionId)?.push(message);
    } else {
      this.#cache.set(sessionId, [message]);
    }
  }

  async get(sessionId: string): Promise<ChatMessage[]> {
    return this.#cache.get(sessionId) || [];
  }
}

const memoryStore = new MemoryStore();

export default async function conversationStore() {
  return memoryStore;
}
