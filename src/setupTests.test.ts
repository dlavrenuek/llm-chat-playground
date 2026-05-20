import '@testing-library/jest-dom';

describe('setupTests.ts', () => {
  describe('global polyfills', () => {
    it('should polyfill ReadableStream globally', () => {
      expect(global.ReadableStream).toBeDefined();
      expect(typeof global.ReadableStream).toBe('function');
    });

    it('should polyfill TextEncoder globally', () => {
      expect(global.TextEncoder).toBeDefined();
      expect(typeof global.TextEncoder).toBe('function');
    });

    it('should polyfill TextDecoder globally', () => {
      expect(global.TextDecoder).toBeDefined();
      expect(typeof global.TextDecoder).toBe('function');
    });

    it('should polyfill Response globally', () => {
      expect(global.Response).toBeDefined();
      expect(typeof global.Response).toBe('function');
    });

    it('should allow creation of TextEncoder instance', () => {
      const encoder = new global.TextEncoder();
      expect(encoder).toBeInstanceOf(global.TextEncoder);
      expect(typeof encoder.encode).toBe('function');
    });

    it('should allow creation of TextDecoder instance', () => {
      const decoder = new global.TextDecoder();
      expect(decoder).toBeInstanceOf(global.TextDecoder);
      expect(typeof decoder.decode).toBe('function');
    });

    it('should allow creation of Response instance', () => {
      const response = new global.Response('test body');
      expect(response).toBeInstanceOf(global.Response);
      expect(response.status).toBe(200);
    });

    // Test that ReadableStream can be instantiated
    it('should allow creation of ReadableStream instance', () => {
      // @ts-ignore - Check if ReadableStream constructor exists
      const readableStream = new global.ReadableStream({
        start(controller) {
          controller.enqueue('data');
          controller.close();
        }
      });
      
      expect(readableStream).toBeDefined();
      expect(typeof readableStream.getReader).toBe('function');
    });

    it('should encode text correctly with TextEncoder', () => {
      const encoder = new global.TextEncoder();
      const testData = 'Hello, world!';
      const encoded = encoder.encode(testData);

      // Check if it's a typed array with the correct buffer type
      expect(encoded.constructor.name).toBe('Uint8Array');
      expect(Array.isArray(Array.from(encoded))).toBe(true);
      expect(Array.from(encoded)).toEqual([
        72, 101, 108, 108, 111, 44, 32, 119, 111, 114, 108, 100, 33
      ]);
    });

    it('should decode text correctly with TextDecoder', () => {
      const decoder = new global.TextDecoder();
      const encodedData = new Uint8Array([72, 101, 108, 108, 111, 44, 32, 119, 111, 114, 108, 100, 33]);
      const decoded = decoder.decode(encodedData);
      
      expect(decoded).toBe('Hello, world!');
    });

    it('should handle Response correctly', async () => {
      const response = new global.Response('test data');
      expect(response.status).toBe(200);
      
      const text = await response.text();
      expect(text).toBe('test data');
    });
  });

  describe('Jest DOM custom matchers', () => {
    it('should have Jest DOM matchers available', () => {
      const element = document.createElement('div');
      element.setAttribute('data-testid', 'test-element');
      document.body.appendChild(element); // Attach to document

      expect(element).toBeInTheDocument();
      expect(element).toHaveAttribute('data-testid', 'test-element');

      // Clean up
      document.body.removeChild(element);
    });

    it('should allow testing of element properties', () => {
      const button = document.createElement('button');
      button.disabled = true;
      button.innerHTML = 'Click me';
      
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Click me');
    });
  });
});