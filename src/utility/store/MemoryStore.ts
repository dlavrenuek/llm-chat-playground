import { ChatMessage, Store } from "./store";

export class MemoryStore implements Store {
  #cache = new Map<string, ChatMessage[]>();

  async add(message: ChatMessage, conversationId: string): Promise<void> {
    if (this.#cache.has(conversationId)) {
      this.#cache.get(conversationId)?.push(message);
    } else {
      this.#cache.set(conversationId, [message]);
    }
  }

  async get(conversationId: string): Promise<ChatMessage[]> {
    return this.#cache.get(conversationId) || [];
  }
}
