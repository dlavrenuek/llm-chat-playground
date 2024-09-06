import Conversation from "@/components/Conversation";
import { getStore } from "@/utility/store";
import { getConversationId } from "@/utility/conversations";

const store = await getStore();

export default async function Home() {
  const conversationId = await getConversationId();
  const initialMessages = conversationId ? await store.get(conversationId) : [];

  return <Conversation initialMessages={initialMessages} />;
}
