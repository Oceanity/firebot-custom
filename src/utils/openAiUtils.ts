import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { ChatCompletion } from "openai/resources";
import env from "@u/envUtils";
import { getRandomItem } from "./array";

export default class OpenAiUtils {
  static chatCompletion = async (messages: ChatCompletionMessageParam[], temperature: number | null = 1.4, model: string = "gpt-3.5-turbo"): Promise<ChatCompletion.Choice> => {
    const openAi = new OpenAI({
      apiKey: env.getEnvVarOrThrow("OPENAI_API_KEY")
    });

    const chatCompletion = getRandomItem<ChatCompletion.Choice>(
      (await openAi.chat.completions.create({
        model,
        temperature,
        messages
      })).choices
    );
    if (!chatCompletion) throw "Could not get completion from provided prompt";

    return chatCompletion;
  }
}
