"use client";

import Message from "@/components/Message";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ChatMessage } from "@/utility/conversationStore";

type ConversationProps = {
  initialMessages?: ChatMessage[];
};

export default function Conversation({
  initialMessages = [],
}: ConversationProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [messageStream, setMessageStream] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const lockScrollRef = useRef<boolean>(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const addMessage = ({ message, type }: ChatMessage) => {
    setMessages((currentMessages) => [...currentMessages, { message, type }]);
  };

  const commitMessageStream = (message: string) => {
    setMessageStream("");
    addMessage({ message, type: "assistant" });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setInput("");
    addMessage({ message: input, type: "user" });
    setLoading(true);
    let _messageStream = "";

    try {
      const res = await fetch("/api", {
        method: "POST",
        body: JSON.stringify({ message: input }),
        headers: { "Content-Type": "application/json" },
      });
      const stream = res.body?.pipeThrough(new TextDecoderStream());

      if (stream) {
        /*
          The type ReadableStream is missing AsyncIterable, although it is implemented:
           * https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream#async_iteration
          See
           * https://github.com/microsoft/TypeScript/issues/39051
           * https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/65542
        */
        for await (const chunk of stream as unknown as AsyncIterable<string>) {
          _messageStream += chunk;
          setMessageStream(_messageStream);
        }
      }
    } catch (e) {
      console.log("An error occurred", e);
    }
    commitMessageStream(_messageStream);
    setLoading(false);
  };

  const checkScrollLock = () => {
    if (scrollRef.current) {
      lockScrollRef.current =
        scrollRef.current.scrollHeight - scrollRef.current.scrollTop ===
        scrollRef.current.offsetHeight;
    }
  };

  useEffect(() => {
    if (scrollRef.current && lockScrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messageStream, messages.length]);

  useEffect(() => {
    !loading && inputRef.current?.focus();
  }, [loading]);

  const hasContent = messages.length || messageStream;

  return (
    <main className="flex grow flex-col items-center justify-between p-12 pt-6 space-y-4 overflow-hidden">
      {hasContent && (
        <div
          className="grow self-stretch overflow-auto pr-4 -mr-4"
          ref={scrollRef}
          onScroll={checkScrollLock}
        >
          {messages.map(({ message, type }, i) => (
            <Message message={message} type={type} key={`${i}_${message}`} />
          ))}
          {loading && (
            <Message message={messageStream} type="assistant" loading />
          )}
        </div>
      )}
      {!hasContent && (
        <div className="grow flex flex-col justify-center text-xl">
          Write something to the bot to start a conversation
        </div>
      )}
      <div className="w-full">
        <form onSubmit={submit} className="flex flex-row space-x-4">
          <input
            className="grow retro input bg-gray-100 disabled:bg-gray-200"
            placeholder="Enter a message"
            onInput={(e) => setInput(e.currentTarget.value)}
            value={input}
            ref={inputRef}
            disabled={loading}
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="retro input bg-gray-200 disabled:bg-gray-400"
          >
            Send
          </button>
        </form>
      </div>
    </main>
  );
}
