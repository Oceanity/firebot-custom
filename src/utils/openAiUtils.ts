import OpenAI from "openai";
import { ChatCompletionCreateParamsNonStreaming } from "openai/resources";

export default class OpenAiUtils {
  private static readonly baseParams: ChatCompletionCreateParamsNonStreaming = {
    model: "gpt-3.5-turbo-instruct",
    max_tokens: 1024,
    temperature: 1.4,
    messages: []
  }

  static chatCompletion = async (params: { [key: string]: unknown }) => {
    const apiKey = process.env["OPENAI_API_KEY"]
    if (!apiKey) throw "Could not get OPENAI_API_KEY from .env";
    const openAi = new OpenAI({
      apiKey
    });
    const chatCompletion = await openAi.chat.completions.create({
      ...OpenAiUtils.baseParams,
      ...params
    });

    return chatCompletion;
  }
}
