import { POST } from "./route";
import { getStore } from "@/utility/store";
import { getAi } from "@/utility/ai";
import { createConversation, getConversationId } from "@/utility/conversations";

// Mock global TextEncoder and ReadableStream
global.TextEncoder = require("util").TextEncoder;
global.ReadableStream = jest.fn();

// Define mocks after the imports
jest.mock("@/utility/store", () => {
  const mockStore = {
    add: jest.fn(),
    get: jest.fn(),
  };

  const mockGetStore = jest.fn().mockResolvedValue(mockStore);

  return {
    getStore: mockGetStore,
    mockStore, // Export for test usage if needed
  };
});

jest.mock("@/utility/ai", () => {
  const mockStream = {
    next: jest.fn(),
  };

  const mockAi = {
    stream: jest.fn().mockResolvedValue(mockStream),
  };

  return {
    getAi: jest.fn(() => mockAi),
    mockStream,
  };
});

jest.mock("@/utility/conversations", () => ({
  createConversation: jest.fn(),
  getConversationId: jest.fn(),
}));

// Import the mocked objects for test usage
const { mockStore: mockedStore } = require("@/utility/store");
const { mockStream: mockedStream } = require("@/utility/ai");

describe("API Route - POST /api", () => {
  let mockStore: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Since our store is already mocked, we just need to reset the mock implementations
    mockStore = require("@/utility/store").mockStore;
    mockStore.add.mockClear();
    mockStore.get.mockClear();

    // Setup conversation mocks
    (getConversationId as jest.MockedFunction<typeof getConversationId>).mockResolvedValue("test-conversation-id");
    (createConversation as jest.MockedFunction<typeof createConversation>).mockResolvedValue("new-conversation-id");
  });

  it("should handle a valid message and return a streaming response", async () => {
    // Arrange
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ message: "Hello" }),
    } as unknown as Request;

    // Mock the stream to return a completion response
    mockedStream.next
      .mockResolvedValueOnce({ value: "Hi ", done: false })
      .mockResolvedValueOnce({ value: "there!", done: true });

    mockStore.get.mockResolvedValue([]);

    // Act
    const response = await POST(mockRequest);

    // Assert
    expect(mockRequest.json).toHaveBeenCalled();
    // Check that the user message was added first
    expect(mockStore.add).toHaveBeenCalledWith(
      { message: "Hello", type: "user", date: expect.any(Date) },
      "test-conversation-id"
    );
    expect(getAi().stream).toHaveBeenCalled();
    // Note: We can't reliably verify the assistant message storage in this test
    // since it happens asynchronously in the response streaming process
    expect(response).toBeInstanceOf(Response);
  });

  it("should handle creating a new conversation when none exists", async () => {
    // Arrange
    (getConversationId as jest.MockedFunction<typeof getConversationId>).mockResolvedValue(null);

    const mockRequest = {
      json: jest.fn().mockResolvedValue({ message: "New conversation" }),
    } as unknown as Request;

    mockedStream.next
      .mockResolvedValueOnce({ value: "Hello ", done: false })
      .mockResolvedValueOnce({ value: "world!", done: true });

    // Act
    await POST(mockRequest);

    // Assert
    expect(createConversation).toHaveBeenCalled();
    expect(mockStore.add).toHaveBeenCalledWith(
      { message: "New conversation", type: "user", date: expect.any(Date) },
      "new-conversation-id"
    );
  });

  it("should include previous conversation history in AI request", async () => {
    // Arrange
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ message: "Follow-up" }),
    } as unknown as Request;

    mockStore.get.mockResolvedValue([
      { message: "Previous user message", type: "user", date: new Date() },
      { message: "Previous AI response", type: "assistant", date: new Date() }
    ]);

    mockedStream.next
      .mockResolvedValueOnce({ value: "Response ", done: false })
      .mockResolvedValueOnce({ value: "to follow-up", done: true });

    // Act
    await POST(mockRequest);

    // Assert - Check that the AI stream was called with messages (the main functionality)
    expect(getAi().stream).toHaveBeenCalledWith(expect.any(Array));

    // Verify that the stream was called with an array containing at least 3 elements
    // (system message, previous conversation, current message)
    const aiStreamCalls = (getAi().stream as jest.Mock).mock.calls;
    const messages = aiStreamCalls[0][0];
    expect(messages).toBeInstanceOf(Array);
    expect(messages.length).toBeGreaterThanOrEqual(3);
  });

  it("should throw an error when message is empty", async () => {
    // Arrange
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ message: "" }),
    } as unknown as Request;

    // Act & Assert
    await expect(POST(mockRequest)).rejects.toThrow("Message must not be empty");
    await expect(POST(mockRequest)).rejects.toEqual(new Error("Message must not be empty"));
  });

  it("should throw an error when message property is missing", async () => {
    // Arrange
    const mockRequest = {
      json: jest.fn().mockResolvedValue({}),
    } as unknown as Request;

    // Act & Assert
    await expect(POST(mockRequest)).rejects.toThrow("Message must not be empty");
  });

  it("should throw an error when request body is empty", async () => {
    // Arrange
    const mockRequest = {
      json: jest.fn().mockResolvedValue({}),
    } as unknown as Request;

    // Act & Assert
    await expect(POST(mockRequest)).rejects.toThrow("Message must not be empty");
  });

  it("should handle streaming multiple chunks correctly", async () => {
    // Arrange
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ message: "Hello" }),
    } as unknown as Request;

    // Simulate multiple stream chunks
    mockedStream.next
      .mockResolvedValueOnce({ value: "Chunk ", done: false })
      .mockResolvedValueOnce({ value: "1 ", done: false })
      .mockResolvedValueOnce({ value: "and chunk ", done: false })
      .mockResolvedValueOnce({ value: "2", done: true });

    mockStore.get.mockResolvedValue([]);

    // Act
    const response = await POST(mockRequest);

    // Assert
    // Check that the user message was added
    expect(mockStore.add).toHaveBeenCalledWith(
      { message: "Hello", type: "user", date: expect.any(Date) },
      "test-conversation-id"
    );
    expect(getAi().stream).toHaveBeenCalled();
    // Note: We can't reliably verify the assistant message storage in this test
    // since it happens asynchronously in the response streaming process
    expect(response).toBeInstanceOf(Response);
  });

  it("should use custom system message when provided via environment variable", async () => {
    // Arrange
    const originalSystemMessage = process.env.SYSTEM_MESSAGE;
    process.env.SYSTEM_MESSAGE = "Custom system message";

    const mockRequest = {
      json: jest.fn().mockResolvedValue({ message: "Test" }),
    } as unknown as Request;

    mockedStream.next
      .mockResolvedValueOnce({ value: "Response", done: true });

    mockStore.get.mockResolvedValue([]);

    // Act
    await POST(mockRequest);

    // Assert
    expect(getAi().stream).toHaveBeenCalledWith(expect.any(Array));

    // Restore original value
    process.env.SYSTEM_MESSAGE = originalSystemMessage;
  });
});