import { ChatMessage } from "@/utility/store";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

type MessageProps = ChatMessage & {
  loading?: boolean;
};

export default function Message({
  message,
  type,
  date,
  loading = false,
}: MessageProps) {
  return (
    <div
      className={`flex flex-row mb-4 ${type === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`lg:max-w-screen-md max-w-full bg-gray-50 p-4 retro ${type === "user" ? "border-tomato" : "border-mustard"}`}
      >
        <h3
          className={`${type === "user" ? "text-right" : "text-left"}`}
          title={date.toISOString()}
        >
          {type === "user" ? "You" : "Assistant"}
          {loading && (
            <span className="animate-spin inline-block ml-2">🥐</span>
          )}
        </h3>
        <div>
          <Markdown
            components={{
              code({ children, className, node, ...rest }) {
                const match = /language-(\w+)/.exec(className || "");
                return match ? (
                  <SyntaxHighlighter language={match[1]}>
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code {...rest} className={className}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {message}
          </Markdown>
        </div>
      </div>
    </div>
  );
}
