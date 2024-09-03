import { ChatMessage } from "@/utility/conversationStore";

export default function Message({ message, type }: ChatMessage) {
  return (
    <div
      className={`flex flex-row mb-4 ${type === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`lg:max-w-screen-md bg-gray-50 p-4 retro ${type === "user" ? "border-tomato" : "border-mustard"}`}
      >
        <h3 className={type === "user" ? "text-right" : "text-left"}>
          {type === "user" ? "You" : "Assistant"}
        </h3>
        <div>{message}</div>
      </div>
    </div>
  );
}
