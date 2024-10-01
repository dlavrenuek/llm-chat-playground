import { ChatOllama } from "@langchain/ollama";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { HuggingFaceInference } from "@langchain/community/llms/hf";

function getModel() {
  if (process.env.HUGGINGFACEHUB_API_KEY) {
    return new HuggingFaceInference({
      model: process.env.HUGGINGFACEHUB_MODEL,
      apiKey: process.env.HUGGINGFACEHUB_API_KEY,
      endpointUrl: process.env.HUGGINGFACEHUB_ENDPOINT_URL,
    });
  }

  return new ChatOllama({
    model: process.env.OLLAMA_MODEL,
  });
}

export function getAi() {
  return getModel().pipe(new StringOutputParser());
}
