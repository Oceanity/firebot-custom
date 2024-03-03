import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { ChatCompletion } from "openai/resources";
import env from "@u/envUtils";
import { getRandomItem } from "./array";

/**
 * Utility class for interacting with the OpenAI API.
 */
export default class OpenAiUtils {
  /**
   * Uses the OpenAI API to generate a chat completion.
   * @param messages The prompt to use to generate the completion.
   * @param temperature The temperature to use when generating the completion. Higher temperatures will result in more creative, but potentially less coherent, text. Defaults to 1.4.
   * @param model The model to use when generating the completion. Defaults to "gpt-3.5-turbo".
   * @returns A choice from the OpenAI API containing the generated completion.
   */
  static chatCompletion = async (
    messages: ChatCompletionMessageParam[],
    temperature: number | null = 1.4,
    model: string = "gpt-3.5-turbo"
  ): Promise<ChatCompletion.Choice> => {
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
