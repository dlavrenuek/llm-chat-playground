import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { createConversation, getConversationId } from "@/utility/conversations";
import { getStore } from "@/utility/store";
import { getAi } from "@/utility/ai";

const ai = getAi();

export async function POST(req: Request) {
  const { message } = await req.json();
  const store = await getStore();

  if (message) {
    const conversationId =
      (await getConversationId()) ?? (await createConversation());
    await store.add(
      { message, type: "user", date: new Date() },
      conversationId,
    );

    const messages = [
      new SystemMessage(
        process.env.SYSTEM_MESSAGE ??
          "You are a professional assistant that brags about how great your conversation partner is",
      ),
      ...(await store.get(conversationId))
        .map(({ message, type }) => {
          switch (type) {
            case "user":
              return new HumanMessage(message);
            case "assistant":
              return new AIMessage(message);
          }
          return null;
        })
        .filter((v) => v !== null),
    ];

    const stream = await ai.stream(messages);
    const date = new Date();
    let fullResponse = "";

    const responseStream = new ReadableStream({
      async pull(controller) {
        const { value, done } = await stream.next();

        if (done) {
          controller.close();
          await store.add(
            { message: fullResponse, type: "assistant", date },
            conversationId,
          );
        } else {
          fullResponse += value;
          controller.enqueue(value);
        }
      },
    });

    return new Response(responseStream);
  }

  throw new Error("Message must not be empty");
}
