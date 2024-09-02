import { ChatMessage } from "@/utility/conversationStore";

export default function Message({ message, type }: ChatMessage) {
  return (
    <div
      className={`flex flex-row mb-4 ${type === "user" ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`lg:max-w-screen-md bg-gray-50 p-4 retro ${type === "user" ? "border-tomato" : "border-mustard"}`}
      >
        <h3 className={type === "user" ? "text-left" : "text-right"}>
          {type === "user" ? "You" : "Assistant"}
        </h3>
        <div>{message}</div>
      </div>
    </div>
  );
}
