import { ChatOllama } from "@langchain/ollama";
import { StringOutputParser } from "@langchain/core/output_parsers";

export function getAi() {
  const model = new ChatOllama({
    model: "llama3.1",
    temperature: 0,
  });

  const parser = new StringOutputParser();
  return model.pipe(parser);
}
