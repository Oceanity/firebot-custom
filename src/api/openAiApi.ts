import { Request, Response } from "express";
import OpenAiUtils from "@/utils/openAiUtils";
import store from "@u/store";
import { ChatCompletionCreateParamsNonStreaming, ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { TriforceOpenAiRequest } from "@t/requests";

export default class OpenAiApi {
  private static readonly route: string = "/openAi";

  constructor() {

  }

  static registerEndpoints = async (): Promise<void> => {
    const { modules, prefix } = store;
    const { httpServer } = modules;

    let result = true;

    result &&= httpServer.registerCustomRoute(prefix, `${this.route}/completion`, "POST", this.postCompletionHandler);
    result &&= httpServer.registerCustomRoute(prefix, `${this.route}/completion/triforce`, "POST", this.trifroceCompletionHandler);

    if (!result) throw "Could not register all endpoints for Open Ai API";
  }

  private static postCompletionHandler = async (req: Request, res: Response) => {
    const { messages, model, temperature } = req.body as ChatCompletionCreateParamsNonStreaming;

    res.send(await OpenAiUtils.chatCompletion(messages, temperature, model));
  }

  private static trifroceCompletionHandler = async (req: Request, res: Response) => {
    const { message } = req.body as TriforceOpenAiRequest;

    const messages: ChatCompletionMessageParam[] = [
        {
            role: "system",
            content: "You are the Triforce of Wisdom from the Legend of Zelda universe, a magical artifact of Hyrule provided and one of the 3 Triforces alongside Power and Courage. You were created by and embody one of the three goddesses, Nayru. You possess the ability to answer any question asked of you with great insight, though perhaps in a mysterious manner. Address the user asking the question as a brave soul or adventurer or some similar gender-neutral term currently on a quest to save Hyrule. Please limit your responses to 500 characters or less."
        },
        {
            role: "user",
            content: message
        }
    ];

    res.send(await OpenAiUtils.chatCompletion(messages));
  }
}
