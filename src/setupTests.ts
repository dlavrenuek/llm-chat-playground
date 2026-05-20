import '@testing-library/jest-dom';

// Polyfills for globals not available in Node.js Jest environment
global.ReadableStream = require('stream/web').ReadableStream;
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;
global.Response = require('node-fetch').Response;