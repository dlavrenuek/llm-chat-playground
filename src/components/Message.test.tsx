import { render, screen } from "@testing-library/react";
import Message from "./Message";
import { ChatMessage } from "@/utility/store";

// Mock the react-markdown and react-syntax-highlighter components
jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("react-syntax-highlighter", () => ({
  Prism: ({ children, language }: { children: React.ReactNode; language?: string }) => (
    <pre data-language={language}>{children}</pre>
  ),
}));

describe("Message", () => {
  const mockDate = new Date("2023-01-01T10:00:00Z");

  const baseMessage: ChatMessage = {
    message: "Test message",
    type: "user",
    date: mockDate,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders user message correctly", () => {
    render(<Message {...baseMessage} />);

    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.getByText("Test message")).toBeInTheDocument();
    expect(screen.getByTitle("2023-01-01T10:00:00.000Z")).toBeInTheDocument();

    // Find the message container div (the one with bg-gray-50 class)
    const messageContainer = screen.getByText("You").closest("div");
    const parentContainer = messageContainer?.parentElement;

    // Check for user-specific classes in parent container
    expect(parentContainer).toHaveClass("justify-end");

    // Check for border class on message container
    expect(messageContainer).toHaveClass("border-tomato");
    expect(screen.getByText("You")).toHaveClass("text-right");
  });

  it("renders assistant message correctly", () => {
    const assistantMessage: ChatMessage = {
      ...baseMessage,
      type: "assistant",
    };

    render(<Message {...assistantMessage} />);

    expect(screen.getByText("Assistant")).toBeInTheDocument();
    expect(screen.getByText("Test message")).toBeInTheDocument();

    const messageContainer = screen.getByText("Assistant").closest("div");
    const parentContainer = messageContainer?.parentElement;

    // Check for assistant-specific classes
    expect(parentContainer).toHaveClass("justify-start");
    expect(messageContainer).toHaveClass("border-mustard");
    expect(screen.getByText("Assistant")).toHaveClass("text-left");
  });

  it("displays loading indicator when loading prop is true", () => {
    render(<Message {...baseMessage} loading={true} />);

    const loadingElement = screen.getByText("🥐");
    expect(loadingElement).toBeInTheDocument();
    expect(loadingElement).toHaveClass("animate-spin");
    expect(loadingElement).toHaveClass("inline-block");
    expect(loadingElement).toHaveClass("ml-2");
  });

  it("does not display loading indicator when loading prop is false", () => {
    render(<Message {...baseMessage} loading={false} />);

    expect(screen.queryByText("🥐")).not.toBeInTheDocument();
  });

  it("does not display loading indicator when loading prop is not provided", () => {
    render(<Message {...baseMessage} />); // loading defaults to false

    expect(screen.queryByText("🥐")).not.toBeInTheDocument();
  });

  it("renders markdown content", () => {
    const messageWithMarkdown = {
      ...baseMessage,
      message: "**bold text** and *italic text*",
    };

    render(<Message {...messageWithMarkdown} />);

    expect(screen.getByText("**bold text** and *italic text*")).toBeInTheDocument();
  });

  it("handles code blocks with syntax highlighting", () => {
    const messageWithCode = {
      ...baseMessage,
      message: "`const x = 1;`",
    };

    render(<Message {...messageWithCode} />);

    // Since we mocked react-markdown, it should render the content normally
    expect(screen.getByText("`const x = 1;`")).toBeInTheDocument();
  });

  it("applies correct layout classes based on message type", () => {
    // Test user message layout
    const { rerender } = render(<Message {...baseMessage} type="user" />);
    const userMessageContainer = screen.getByText("You").closest("div");
    expect(userMessageContainer?.parentElement).toHaveClass("justify-end");

    // Test assistant message layout
    rerender(<Message {...baseMessage} type="assistant" />);
    const assistantMessageContainer = screen.getByText("Assistant").closest("div");
    expect(assistantMessageContainer?.parentElement).toHaveClass("justify-start");
  });

  it("includes retro class styling", () => {
    render(<Message {...baseMessage} />);

    const messageDiv = screen.getByText("You").closest("div");
    expect(messageDiv).toHaveClass("retro");
  });

  it("sets max-width classes appropriately", () => {
    render(<Message {...baseMessage} />);

    const messageDiv = screen.getByText("You").closest("div");
    expect(messageDiv).toHaveClass("lg:max-w-screen-md");
    expect(messageDiv).toHaveClass("max-w-full");
  });

  it("applies bg-gray-50 class", () => {
    render(<Message {...baseMessage} />);

    const messageDiv = screen.getByText("You").closest("div");
    expect(messageDiv).toHaveClass("bg-gray-50");
  });

  it("adds padding class", () => {
    render(<Message {...baseMessage} />);

    const messageDiv = screen.getByText("You").closest("div");
    expect(messageDiv).toHaveClass("p-4");
  });

  it("adds mb-4 class for bottom margin", () => {
    render(<Message {...baseMessage} />);

    const outerContainer = screen.getByText("You").closest("div")?.parentElement;
    expect(outerContainer).toHaveClass("mb-4");
  });
});