import Conversation from "@/components/Conversation";
import conversationStore from "@/utility/conversationStore";
import { getSessionId } from "@/utility/session";

const store = await conversationStore();

export default async function Home() {
  const sessionId = await getSessionId();
  const initialMessages = sessionId ? await store.get(sessionId) : [];

  return <Conversation initialMessages={initialMessages} />;
}
