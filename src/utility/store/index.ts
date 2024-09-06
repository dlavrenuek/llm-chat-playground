import { MemoryStore } from "./MemoryStore";
import { Store } from "./store";
import { MongoDBStore } from "@/utility/store/MongoDBStore";

export type { ChatMessage } from "./store";

let store: null | Promise<Store> | Store = null;

async function createStore() {
  if (!process.env.DB_URL) {
    console.log("Creating memory store");
    return new MemoryStore();
  }

  if (process.env.DB_URL.startsWith("mongodb")) {
    console.log("Creating MongoDB store");
    const store = new MongoDBStore(process.env.DB_URL);
    await store.connect();
    return store;
  }

  throw new Error("Database specified in DB_URL not supported");
}

export async function getStore(): Promise<Store> {
  if (store === null) {
    store = new Promise(async (resolve) => {
      store = await createStore();
      resolve(store);
    });
  }

  return store;
}
