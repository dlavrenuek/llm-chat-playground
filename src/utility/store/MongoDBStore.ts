import { ChatMessage, Store } from "./store";
import { MongoClient } from "mongodb";

type MessageDocument = ChatMessage & { conversationId: string };

export class MongoDBStore implements Store {
  #client: MongoClient;

  constructor(url: string) {
    this.#client = new MongoClient(url);
  }

  async connect() {
    await this.#client.connect();
  }

  private messages() {
    return this.#client.db("chat").collection<MessageDocument>("messages");
  }

  async add(message: ChatMessage, conversationId: string): Promise<void> {
    await this.messages().insertOne({ ...message, conversationId });
  }

  async get(conversationId: string): Promise<ChatMessage[]> {
    return this.messages()
      .find({ conversationId }, { projection: { _id: 0 } })
      .toArray();
  }
}
