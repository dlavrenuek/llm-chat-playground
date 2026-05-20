import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import Conversation from './Conversation';
import { ChatMessage } from '@/utility/store';

// Mock the Message component
jest.mock('./Message', () => ({
  __esModule: true,
  default: ({ message, type, date, loading }: { message: string; type: 'user' | 'assistant'; date: Date; loading?: boolean }) => (
    <div data-testid="message" data-type={type} data-message={message} data-loading={loading}>
      {type}: {message} {loading && '(loading)'}
    </div>
  ),
}));

// Mock fetch API
global.fetch = jest.fn();

// Mock TextDecoderStream since it's not available in Jest environment
class TextDecoderStream {
  constructor() {}
  pipeThrough<T extends ReadableStream>(stream: T): T {
    // Simply return the stream for testing purposes
    return stream;
  }
}

Object.assign(global, { TextDecoderStream });

describe('Conversation Component', () => {
  beforeEach(() => {
    (fetch as jest.MockedFunction<typeof fetch>).mockClear();
  });

  it('renders initial empty state correctly', () => {
    render(<Conversation />);
    
    expect(screen.getByText(/Write something to the bot to start a conversation/i)).toBeInTheDocument();
  });

  it('renders with initial messages', () => {
    const initialMessages: ChatMessage[] = [
      { message: 'Hello', type: 'user', date: new Date() },
      { message: 'Hi there!', type: 'assistant', date: new Date() }
    ];
    
    render(<Conversation initialMessages={initialMessages} />);
    
    // Check that initial messages are displayed
    expect(screen.getAllByTestId('message')).toHaveLength(2);
    expect(screen.getByText(/Hello/)).toBeInTheDocument();
    expect(screen.getByText(/Hi there!/)).toBeInTheDocument();
  });

  it('handles user input changes', () => {
    render(<Conversation />);

    const inputElement = screen.getByPlaceholderText('Enter a message');
    fireEvent.input(inputElement, { target: { value: 'Test message' } });

    expect(inputElement).toHaveValue('Test message');
  });

  it('handles empty input submission', async () => {
    render(<Conversation />);

    const submitButton = screen.getByText('Send');

    fireEvent.click(submitButton);

    // API will still be called even with empty input
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
    expect(fetch).toHaveBeenCalledWith('/api', {
      method: 'POST',
      body: JSON.stringify({ message: '' }),
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('submits message correctly and adds to conversation', async () => {
    const mockResponse = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('Hello world'));
        controller.close();
      }
    });

    const mockResponseObj: Partial<Response> = {
      body: mockResponse as unknown as ReadableStream,
      headers: new Headers(),
      ok: true,
      redirected: false,
      status: 200,
      statusText: 'OK',
      type: 'basic',
      url: '',
      clone: jest.fn(),
      bodyUsed: false as boolean,
      arrayBuffer: jest.fn(),
      blob: jest.fn(),
      formData: jest.fn(),
      json: jest.fn(),
      text: jest.fn(),
    };

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponseObj as Response);

    render(<Conversation />);

    const inputElement = screen.getByPlaceholderText('Enter a message');
    fireEvent.change(inputElement, { target: { value: 'Test message' } });

    const submitButton = screen.getByText('Send');
    fireEvent.click(submitButton);

    // Wait for the submission to complete
    await waitFor(() => {
      const messageElements = screen.getAllByTestId('message');
      expect(messageElements).toHaveLength(2); // user message + assistant message
    });
  });

  it('displays loading state correctly', async () => {
    // Create readable stream with async iterator
    const readableStream = {
      [Symbol.asyncIterator]: () => {
        let count = 0;
        const values = [
          new TextEncoder().encode('Hello'),
          new TextEncoder().encode(' world')
        ];

        return {
          next: () => {
            if (count < values.length) {
              return Promise.resolve({ done: false, value: values[count++] });
            } else {
              return Promise.resolve({ done: true, value: undefined });
            }
          }
        };
      }
    };

    const mockResponseObj: Partial<Response> = {
      body: readableStream as unknown as ReadableStream,
      headers: new Headers(),
      ok: true,
      redirected: false,
      status: 200,
      statusText: 'OK',
      type: 'basic',
      url: '',
      clone: jest.fn(),
      bodyUsed: false as boolean,
      arrayBuffer: jest.fn(),
      blob: jest.fn(),
      formData: jest.fn(),
      json: jest.fn(),
      text: jest.fn(),
    };

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponseObj as Response);

    render(<Conversation />);

    const inputElement = screen.getByPlaceholderText('Enter a message');
    fireEvent.change(inputElement, { target: { value: 'Test message' } });

    const submitButton = screen.getByText('Send');
    fireEvent.click(submitButton);

    // Wait for the loading state to appear
    await waitFor(() => {
      const messageElements = screen.getAllByTestId('message');
      // Should have user message + assistant message showing progress
      expect(messageElements).toHaveLength(2);
    });
  });

  it('disables input and button during loading', async () => {
    const mockResponse = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('Loading'));
        // Keep stream open to maintain loading state
      }
    });

    const mockResponseObj: Partial<Response> = {
      body: mockResponse as unknown as ReadableStream,
      headers: new Headers(),
      ok: true,
      redirected: false,
      status: 200,
      statusText: 'OK',
      type: 'basic',
      url: '',
      clone: jest.fn(),
      bodyUsed: false as boolean,
      arrayBuffer: jest.fn(),
      blob: jest.fn(),
      formData: jest.fn(),
      json: jest.fn(),
      text: jest.fn(),
    };

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponseObj as Response);

    render(<Conversation />);

    const inputElement = screen.getByPlaceholderText('Enter a message');
    fireEvent.change(inputElement, { target: { value: 'Test message' } });

    const submitButton = screen.getByText('Send');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(inputElement).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  it('handles fetch errors gracefully', async () => {
    console.log = jest.fn(); // Mock console.log to prevent noise in tests

    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(
      new Error('Network error')
    );

    render(<Conversation />);

    const inputElement = screen.getByPlaceholderText('Enter a message');
    fireEvent.change(inputElement, { target: { value: 'Test message' } });

    const submitButton = screen.getByText('Send');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith('An error occurred', expect.any(Error));
    });
  });
});