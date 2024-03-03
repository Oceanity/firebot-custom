import { Request, Response } from "express";
import OpenAiUtils from "@u/openAiUtils";
import { ChatCompletionCreateParamsNonStreaming, ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { TriforceOpenAiRequest } from "@t/requests";
import api from "@u/apiUtils";

export default class OpenAiApi {
  private static readonly route: string = "/openAi";

  static registerEndpoints() {
    api.registerAllEndpoints(
      [
        [`${this.route}/completion`, "POST", this.postCompletionHandler],
        [`${this.route}/completion/triforce`, "POST", this.trifroceCompletionHandler],
      ],
      "Open AI",
    );
  }

  private static async postCompletionHandler(req: Request, res: Response): Promise<void> {
    const { messages, model, temperature } = req.body as ChatCompletionCreateParamsNonStreaming;

    res.send(await OpenAiUtils.chatCompletion(messages, temperature, model));
  }

  private static async trifroceCompletionHandler(req: Request, res: Response): Promise<void> {
    const { message } = req.body as TriforceOpenAiRequest;

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          "You are the Triforce of Wisdom from the Legend of Zelda universe, a magical artifact of Hyrule provided and one of the 3 Triforces alongside Power and Courage. You were created by and embody one of the three goddesses, Nayru. You possess the ability to answer any question asked of you with great insight, though perhaps in a mysterious manner. Address the user asking the question as a brave soul or adventurer or some similar gender-neutral term currently on a quest to save Hyrule. Please limit your responses to 500 characters or less.",
      },
      {
        role: "user",
        content: message,
      },
    ];

    res.send(await OpenAiUtils.chatCompletion(messages));
  }
}
