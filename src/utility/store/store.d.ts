export type ChatMessage = {
  message: string;
  type: "user" | "assistant";
  date: Date;
};

interface Store {
  get(conversationId: string): Promise<ChatMessage[]>;
  add(message: ChatMessage, conversationId: string): Promise<void>;
}
