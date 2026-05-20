import { getConversationId, createConversation } from "./conversations";

// Cookie storage to maintain state between calls
const cookieStorage: Record<string, any> = {};

// Create a persistent cookies manager to ensure consistent state across calls
const mockCookiesManager = {
  get: (name: string) => cookieStorage[name] ? { value: cookieStorage[name] } : undefined,
  set: (name: string, value: string) => { cookieStorage[name] = value; }
};

// Also mock randomUUID from node:crypto
jest.mock('node:crypto', () => ({
  ...jest.requireActual('node:crypto'),
  randomUUID: jest.fn(),
}));

const { randomUUID } = require('node:crypto');

// Since these are server actions that use Next.js APIs, we need to properly mock the environment
// Mock the next/headers module appropriately for server components
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => mockCookiesManager),
  __esModule: true,
}));

const { cookies } = require('next/headers');

describe('conversations utility functions', () => {
  beforeEach(() => {
    // Don't clear all mocks as it interferes with the persistent cookies manager
    // Instead, just clear the call history for the cookies mock
    (cookies as jest.MockedFunction<any>).mockClear();

    // Clear cookie storage before each test to avoid cross-test pollution
    Object.keys(cookieStorage).forEach(key => delete cookieStorage[key]);

    (randomUUID as jest.MockedFunction<any>).mockReset();
  });

  describe('getConversationId', () => {
    it('should return the conversation ID if cookie exists and has correct length', async () => {
      const validUUID = '12345678-1234-1234-1234-123456789abc'; // 36 characters
      cookieStorage['conversations'] = validUUID;

      const result = await getConversationId();

      expect(result).toBe(validUUID);
      expect(cookies).toHaveBeenCalled();
    });

    it('should return null if no cookie exists', async () => {
      delete cookieStorage['conversations']; // Ensure it doesn't exist

      const result = await getConversationId();

      expect(result).toBeNull();
      expect(cookies).toHaveBeenCalled();
    });

    it('should return null if cookie value is empty string', async () => {
      cookieStorage['conversations'] = '';

      const result = await getConversationId();

      expect(result).toBeNull();
      expect(cookies).toHaveBeenCalled();
    });

    it('should return null if cookie value has incorrect length', async () => {
      const invalidUUID = 'short';
      cookieStorage['conversations'] = invalidUUID;

      const result = await getConversationId();

      expect(result).toBeNull();
      expect(cookies).toHaveBeenCalled();
    });

    it('should return the value if cookie exists and has correct length (length check only)', async () => {
      const notUUID = 'a'.repeat(36); // 36 chars but not a UUID
      cookieStorage['conversations'] = notUUID;

      const result = await getConversationId();

      expect(result).toBe(notUUID); // The original function only checks length, not UUID format
      expect(cookies).toHaveBeenCalled();
    });
  });

  describe('createConversation', () => {
    it('should create a new conversation ID and set it in cookies', async () => {
      const generatedUUID = 'test-uuid-1234-5678-9012-test-uuid-1234';
      (randomUUID as jest.MockedFunction<any>).mockReturnValue(generatedUUID);

      const result = await createConversation();

      expect(result).toBe(generatedUUID);
      expect(cookies).toHaveBeenCalled();
      expect(cookieStorage['conversations']).toBe(generatedUUID);
    });

    it('should generate a UUID using randomUUID', async () => {
      const generatedUUID = 'generated-uuid-unique-test';
      const randomUUIDMock = randomUUID as jest.MockedFunction<any>;
      randomUUIDMock.mockReturnValue(generatedUUID);

      await createConversation();

      expect(randomUUIDMock).toHaveBeenCalled();
    });

    it('should store the generated UUID in cookies', async () => {
      const generatedUUID = 'another-test-uuid-unique';
      (randomUUID as jest.MockedFunction<any>).mockReturnValue(generatedUUID);

      await createConversation();

      expect(cookieStorage['conversations']).toBe(generatedUUID);
    });
  });

  describe('integration tests', () => {
    it('should create a conversation and then retrieve it', async () => {
      const generatedUUID = '12345678-1234-1234-1234-123456789abc'; // 36 characters - proper UUID format
      (randomUUID as jest.MockedFunction<any>).mockReturnValue(generatedUUID);

      // Create a conversation (this should set the cookie)
      const createdId = await createConversation();
      expect(createdId).toBe(generatedUUID);

      // Retrieve the conversation ID (should get from the same cookie store)
      const retrievedId = await getConversationId();
      expect(retrievedId).toBe(generatedUUID);
    });

    it('should return null when getting conversation ID after clearing the cookie', async () => {
      delete cookieStorage['conversations'];
      const result = await getConversationId();
      expect(result).toBeNull();
    });
  });
});