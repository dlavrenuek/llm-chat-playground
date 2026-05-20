import { MemoryStore } from './MemoryStore';

describe('MemoryStore', () => {
  let store: MemoryStore;

  beforeEach(() => {
    store = new MemoryStore();
  });

  describe('add', () => {
    it('should add a message to a new conversation', async () => {
      const message = {
        message: 'Hello world',
        type: 'user' as const,
        date: new Date(),
      };
      const conversationId = 'test-conversation';

      await store.add(message, conversationId);

      const messages = await store.get(conversationId);
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual(message);
    });

    it('should add multiple messages to the same conversation', async () => {
      const message1 = {
        message: 'First message',
        type: 'user' as const,
        date: new Date(),
      };
      const message2 = {
        message: 'Second message',
        type: 'assistant' as const,
        date: new Date(),
      };
      const conversationId = 'test-conversation';

      await store.add(message1, conversationId);
      await store.add(message2, conversationId);

      const messages = await store.get(conversationId);
      expect(messages).toHaveLength(2);
      expect(messages[0]).toEqual(message1);
      expect(messages[1]).toEqual(message2);
    });

    it('should handle multiple conversations separately', async () => {
      const message1 = {
        message: 'Message in conversation 1',
        type: 'user' as const,
        date: new Date(),
      };
      const message2 = {
        message: 'Message in conversation 2',
        type: 'assistant' as const,
        date: new Date(),
      };
      const conversationId1 = 'conversation-1';
      const conversationId2 = 'conversation-2';

      await store.add(message1, conversationId1);
      await store.add(message2, conversationId2);

      const messages1 = await store.get(conversationId1);
      const messages2 = await store.get(conversationId2);

      expect(messages1).toHaveLength(1);
      expect(messages1[0]).toEqual(message1);
      expect(messages2).toHaveLength(1);
      expect(messages2[0]).toEqual(message2);
    });
  });

  describe('get', () => {
    it('should return empty array for non-existent conversation', async () => {
      const messages = await store.get('non-existent-conversation');
      expect(messages).toEqual([]);
    });

    it('should return all messages for an existing conversation', async () => {
      const message = {
        message: 'Test message',
        type: 'user' as const,
        date: new Date(),
      };
      const conversationId = 'test-conversation';

      await store.add(message, conversationId);

      const messages = await store.get(conversationId);
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual(message);
    });

    it('should return messages in the order they were added', async () => {
      const message1 = {
        message: 'First',
        type: 'user' as const,
        date: new Date(),
      };
      const message2 = {
        message: 'Second',
        type: 'assistant' as const,
        date: new Date(),
      };
      const message3 = {
        message: 'Third',
        type: 'user' as const,
        date: new Date(),
      };
      const conversationId = 'ordered-conversation';

      // Add messages in sequence
      await store.add(message1, conversationId);
      await store.add(message2, conversationId);
      await store.add(message3, conversationId);

      const messages = await store.get(conversationId);
      expect(messages).toHaveLength(3);
      expect(messages[0]).toEqual(message1);
      expect(messages[1]).toEqual(message2);
      expect(messages[2]).toEqual(message3);
    });
  });

  describe('integration', () => {
    it('should handle concurrent operations correctly', async () => {
      const promises = [];
      const conversationIds = ['conv1', 'conv2', 'conv3'];

      for (let i = 0; i < 5; i++) {
        for (const convId of conversationIds) {
          const type: 'user' | 'assistant' = i % 2 === 0 ? 'user' : 'assistant';
          const message = {
            message: `Message ${i} in ${convId}`,
            type,
            date: new Date(),
          };

          promises.push(store.add(message, convId));
        }
      }

      await Promise.all(promises);

      for (const convId of conversationIds) {
        const messages = await store.get(convId);
        expect(messages).toHaveLength(5);
        expect(messages.every(msg => msg.message.includes(convId))).toBe(true);
      }
    });
  });
});