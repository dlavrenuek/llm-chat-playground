import Conversation from "@/components/Conversation";
import { getStore } from "@/utility/store";
import { getConversationId } from "@/utility/conversations";

export default async function Home() {
  const store = await getStore();
  const conversationId = await getConversationId();
  const initialMessages = conversationId ? await store.get(conversationId) : [];

  return <Conversation initialMessages={initialMessages} />;
}
