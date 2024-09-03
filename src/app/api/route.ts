"use server";

import { ChatOllama } from "@langchain/ollama";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { createSession, getSessionId } from "@/utility/session";
import conversationStore from "@/utility/conversationStore";

const store = await conversationStore();

const model = new ChatOllama({
  model: "llama3.1",
  temperature: 0,
});

const parser = new StringOutputParser();

const chain = model.pipe(parser);

export async function POST(req: Request) {
  const { message } = await req.json();

  if (message) {
    const sessionId = (await getSessionId()) ?? (await createSession());
    await store.add({ message, type: "user" }, sessionId);

    const messages = [
      new SystemMessage("You are a helpful but sarcastic assistant"),
      ...(await store.get(sessionId))
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

    const stream = await chain.stream(messages);
    let fullResponse = "";

    const responseStream = new ReadableStream({
      async pull(controller) {
        const { value, done } = await stream.next();

        if (done) {
          controller.close();
          await store.add(
            { message: fullResponse, type: "assistant" },
            sessionId,
          );
        } else {
          fullResponse += value;
          controller.enqueue(value);
        }
      },
    });

    return new Response(responseStream);
  }

  return "error?";
}
