import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import OpenAI from "openai";
import { ChatCompletionMessageParam, ChatCompletionCreateParamsNonStreaming } from "openai/resources";

export default class OpenApiUtils {
  private readonly modules: ScriptModules;
  private readonly openAi: OpenAI;
  private readonly chatApiBase: string;
  private readonly baseBody: ChatCompletionCreateParamsNonStreaming;

  constructor(modules: ScriptModules) {
    modules.logger.info(process.env.OPENAI_API_KEY ?? "");

    this.modules = modules;
    this.openAi = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
    this.chatApiBase = "https://api.openai.com/v1/completions";
    this.baseBody = {
      model: "gpt-3.5-turbo-instruct",
      max_tokens: 1024,
      temperature: 1.4,
      messages: []
    }
  }

  public chatCompletion = async (messages: ChatCompletionMessageParam[]) => {
    const newBody = this.baseBody;
    newBody.messages = [...newBody.messages, ...messages];

    this.modules.logger.info(`Creating openAi completion with body ${JSON.stringify(newBody)}`);

    const chatCompletion = await this.openAi.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 1.4,
      messages
    });

    this.modules.logger.info(JSON.stringify(chatCompletion));

    return chatCompletion;
  }
}
