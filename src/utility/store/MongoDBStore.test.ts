import { MongoDBStore } from './MongoDBStore';
import { MongoClient } from 'mongodb';

// Define types for our mock objects
interface MockCollection {
  insertOne: jest.Mock;
  find: jest.Mock;
}

interface MockDb {
  collection: jest.Mock;
}

interface MockClient {
  db: jest.Mock;
  connect: jest.Mock;
}

// Create mock objects
const mockInsertOne = jest.fn();
const mockFindProject = jest.fn(() => ({ toArray: jest.fn() }));
const mockFind = jest.fn(() => ({ toArray: jest.fn(), project: mockFindProject }));
const mockCollection: MockCollection = {
  insertOne: mockInsertOne,
  find: mockFind,
};
const mockDb: MockDb = {
  collection: jest.fn(() => mockCollection),
};
const mockConnect = jest.fn();
const mockClient: MockClient = {
  db: jest.fn(() => mockDb),
  connect: mockConnect,
};

// Mock the mongodb module
jest.mock('mongodb', () => ({
  MongoClient: jest.fn(() => mockClient),
}));

describe('MongoDBStore', () => {
  let mongoDBStore: MongoDBStore;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Initialize the store with a mock URL
    mongoDBStore = new MongoDBStore('mongodb://localhost:27017/test');
  });

  describe('constructor', () => {
    it('should initialize the MongoDB client with the provided URL', () => {
      // Reinitialize to verify the constructor call
      const newStore = new MongoDBStore('mongodb://test-url:27017/db');
      expect(MongoClient).toHaveBeenCalledWith('mongodb://test-url:27017/db');
    });
  });

  describe('connect', () => {
    it('should connect to the MongoDB client', async () => {
      await mongoDBStore.connect();

      expect(mockConnect).toHaveBeenCalled();
    });
  });

  describe('add', () => {
    it('should add a message to the collection with conversationId', async () => {
      const message = {
        message: 'Hello world',
        type: 'user' as const,
        date: new Date(),
      };
      const conversationId = 'test-conversation';

      await mongoDBStore.add(message, conversationId);

      expect(mockCollection.insertOne).toHaveBeenCalledWith({
        ...message,
        conversationId,
      });
    });

    it('should handle message addition properly', async () => {
      const message = {
        message: 'Hi there!',
        type: 'assistant' as const,
        date: new Date('2023-01-01'),
      };
      const conversationId = 'another-conversation';

      await mongoDBStore.add(message, conversationId);

      expect(mockCollection.insertOne).toHaveBeenCalledTimes(1);
      const callArgs = mockInsertOne.mock.calls[0][0];
      expect(callArgs.conversationId).toBe(conversationId);
      expect(callArgs.message).toBe(message.message);
      expect(callArgs.type).toBe(message.type);
      expect(callArgs.date).toEqual(message.date);
    });
  });

  describe('get', () => {
    it('should retrieve messages for a given conversationId', async () => {
      const conversationId = 'test-conversation';
      const expectedMessages = [
        { message: 'Hello', type: 'user', date: new Date(), conversationId },
        { message: 'Hi there!', type: 'assistant', date: new Date(), conversationId },
      ];

      const mockToArray = jest.fn().mockResolvedValue(expectedMessages);
      mockFind.mockReturnValue({
        toArray: mockToArray,
        project: jest.fn(() => ({ toArray: mockToArray }))
      });

      const result = await mongoDBStore.get(conversationId);

      expect(mockFind).toHaveBeenCalledWith(
        { conversationId },
        { projection: { _id: 0 } }
      );
      expect(result).toEqual(expectedMessages);
    });

    it('should return empty array when no messages found', async () => {
      const conversationId = 'empty-conversation';

      const mockToArray = jest.fn().mockResolvedValue([]);
      mockFind.mockReturnValue({
        toArray: mockToArray,
        project: jest.fn(() => ({ toArray: mockToArray }))
      });

      const result = await mongoDBStore.get(conversationId);

      expect(result).toEqual([]);
      expect(mockFind).toHaveBeenCalledWith(
        { conversationId },
        { projection: { _id: 0 } }
      );
    });
  });
});