import NuthatchUtils from "@/utils/nuthatchUtils";
import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { Request, Response } from "express";
import * as dotenv from "dotenv";
import OpenApiUtils from "@/utils/openAiUtils";
import DbUtils from "@/utils/dbUtils";
dotenv.config({ path: __dirname + '/.env' });

export default class BirdFactApi {
  private readonly nuthatchUtils: NuthatchUtils;
  private readonly openAiUtils: OpenApiUtils;
  private readonly dbUtils: DbUtils;
  private readonly modules: ScriptModules;
  private readonly prefix: string;
  private readonly base: string;

  private birdCount: number;

  constructor(modules: ScriptModules) {
    this.nuthatchUtils = new NuthatchUtils(modules);
    this.openAiUtils = new OpenApiUtils(modules);
    this.dbUtils = new DbUtils("./db/birbFacts.db", modules);
    this.modules = modules;
    this.birdCount = 0;

    this.prefix = "oceanity";
    this.base = "/birdFacts";
  }

  public setup = async () => {
    this.modules.logger.info("Setting up BirdFactApi...");
    await this.dbUtils.setup();
    await this.nuthatchUtils.setup();
    await this.registerEndpoints();
  }

  private registerEndpoints = async () => {
    const { modules, prefix, base } = this;
    const { httpServer } = modules;

    httpServer.registerCustomRoute(prefix, base, "GET", this.getBirdFactHandler);
  }

  private getBirdFactHandler = async (req: Request, res: Response) => {
    const birdResponse = await this.nuthatchUtils.getRandomBird();

    const chatResponse = await this.openAiUtils.chatCompletion([
      { role: "system", content: "You are a female ornithologist who doesn't actually know as much about birds as you think, but will confidently state incorrect facts about them." },
      { role: "user", content: `Can you give me a made up and outlandish fact about the ${birdResponse.name} and how this fact effects the bird in its life, examples include intersting things about its call, plumeage, defense mechanisms, eating habits, migration habits, mating rituals, how they taste, their use in human society, etc. Limit your response to a few sentences in a single line of text that doesn't include any commentary responding to the question asked` }
    ]);

    res.send({
      birdName: birdResponse.name,
      message: chatResponse.choices.pop()?.message.content?.replace(/[\s\r\n]+/ig, " ").trim()
    });
  }

  /*private getBirdFactHanlder = async (req: Request, res: Response) => {
    await fetch()
  }*/
}
