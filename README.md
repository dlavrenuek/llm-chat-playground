This is a playground UI for Large Language Modals (LLMs). It utilizes:
- [LangChain.js](https://github.com/langchain-ai/langchainjs) for model call abstraction and Retrieval-Augmented Generation (RAG)
- [React](https://github.com/facebook/react) and [Next.js](https://github.com/vercel/next.js) for UI and server

## Prerequisites

To run this project you need
- [Node.js®](https://nodejs.org/en/download/package-manager) v20+
- [pnpm](https://pnpm.io/installation) 9+
- [Ollama](https://ollama.com/download)

## Run locally

This playground currently only supports a locally running Ollama server with llama3.1. To start the model run:

```bash
ollama run llama3.1
```

To start the application in development mode run:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

