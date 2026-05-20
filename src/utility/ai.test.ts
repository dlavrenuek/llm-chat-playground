// Mock the external dependencies with proper pipe methods before importing
const mockPipeFn = jest.fn();
const mockChatOllamaConstructor = jest.fn();
const mockHuggingFaceConstructor = jest.fn();
const mockStringOutputParserConstructor = jest.fn();

jest.mock("@langchain/ollama", () => ({
  ChatOllama: mockChatOllamaConstructor,
}));

jest.mock("@langchain/core/output_parsers", () => ({
  StringOutputParser: mockStringOutputParserConstructor,
}));

jest.mock("@langchain/community/llms/hf", () => ({
  HuggingFaceInference: mockHuggingFaceConstructor,
}));

import { ChatOllama } from "@langchain/ollama";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { HuggingFaceInference } from "@langchain/community/llms/hf";
import { getAi } from "./ai";

describe("AI Utility Functions", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    jest.resetModules();
    process.env = { ...originalEnv };

    // Reset mocks
    mockPipeFn.mockClear();
    mockChatOllamaConstructor.mockClear();
    mockHuggingFaceConstructor.mockClear();
    mockStringOutputParserConstructor.mockClear();

    // Set up the constructors to return objects with pipe method
    mockChatOllamaConstructor.mockImplementation((...args) => ({
      pipe: mockPipeFn,
      args,
    }));

    mockHuggingFaceConstructor.mockImplementation((...args) => ({
      pipe: mockPipeFn,
      args,
    }));

    mockStringOutputParserConstructor.mockImplementation(() => ({}));
  });

  afterEach(() => {
    // Restore original environment after each test
    process.env = originalEnv;
  });

  describe("getAi", () => {
    it("should return an AI instance configured with Hugging Face when HUGGINGFACEHUB_API_KEY is present", () => {
      // Set up environment variables for Hugging Face
      process.env.HUGGINGFACEHUB_API_KEY = "test-api-key";
      process.env.HUGGINGFACEHUB_MODEL = "test-model";
      process.env.HUGGINGFACEHUB_ENDPOINT_URL = "https://test-endpoint.com";

      // Import the module after setting environment variables
      const { getAi } = require("./ai");

      // Call the function
      const aiInstance = getAi();

      // Verify that HuggingFaceInference was called with correct parameters
      expect(mockHuggingFaceConstructor).toHaveBeenCalledWith({
        model: "test-model",
        apiKey: "test-api-key",
        endpointUrl: "https://test-endpoint.com",
      });

      // Verify that ChatOllama was not called
      expect(mockChatOllamaConstructor).not.toHaveBeenCalled();

      // Verify that StringOutputParser was called (as part of pipe)
      expect(mockStringOutputParserConstructor).toHaveBeenCalledTimes(1);

      // Verify that pipe was called
      expect(mockPipeFn).toHaveBeenCalled();
    });

    it("should return an AI instance configured with Ollama when HUGGINGFACEHUB_API_KEY is not present", () => {
      // Unset Hugging Face environment variables
      delete process.env.HUGGINGFACEHUB_API_KEY;
      process.env.OLLAMA_MODEL = "test-ollama-model";

      // Import the module after setting environment variables
      const { getAi } = require("./ai");

      // Call the function
      const aiInstance = getAi();

      // Verify that ChatOllama was called with correct parameters
      expect(mockChatOllamaConstructor).toHaveBeenCalledWith({
        model: "test-ollama-model",
      });

      // Verify that HuggingFaceInference was not called
      expect(mockHuggingFaceConstructor).not.toHaveBeenCalled();

      // Verify that StringOutputParser was called (as part of pipe)
      expect(mockStringOutputParserConstructor).toHaveBeenCalledTimes(1);

      // Verify that pipe was called
      expect(mockPipeFn).toHaveBeenCalled();
    });

    it("should return an AI instance with default Ollama configuration when no environment variables are set", () => {
      // Clear all relevant environment variables
      delete process.env.HUGGINGFACEHUB_API_KEY;
      delete process.env.HUGGINGFACEHUB_MODEL;
      delete process.env.HUGGINGFACEHUB_ENDPOINT_URL;
      delete process.env.OLLAMA_MODEL;

      // Import the module after setting environment variables
      const { getAi } = require("./ai");

      // Call the function
      const aiInstance = getAi();

      // Verify that ChatOllama was called with undefined model
      expect(mockChatOllamaConstructor).toHaveBeenCalledWith({
        model: undefined,
      });

      // Verify that HuggingFaceInference was not called
      expect(mockHuggingFaceConstructor).not.toHaveBeenCalled();

      // Verify that StringOutputParser was called (as part of pipe)
      expect(mockStringOutputParserConstructor).toHaveBeenCalledTimes(1);

      // Verify that pipe was called
      expect(mockPipeFn).toHaveBeenCalled();
    });

    it("should properly pipe the model with StringOutputParser", () => {
      // Set up environment for Ollama
      delete process.env.HUGGINGFACEHUB_API_KEY;
      process.env.OLLAMA_MODEL = "test-model";

      // Import the module after setting environment variables
      const { getAi } = require("./ai");

      // Call the function
      const result = getAi();

      // Verify that pipe was called
      expect(mockPipeFn).toHaveBeenCalled();
    });
  });
});