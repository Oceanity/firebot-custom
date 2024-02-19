import NuthatchUtils from "@/utils/nuthatchUtils";
import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { Request, Response } from "express";
import * as dotenv from "dotenv";
import OpenApiUtils from "@/utils/openAiUtils";
import DbUtils from "@/utils/dbUtils";
import { BirbFact } from "@t/birbFacts";
import { getRandomItem } from "@/utils/array";
import { getRequestDataFromUri } from "@/utils/requestUtils";
dotenv.config({ path: __dirname + '/.env' });

// TODO: Move these to Db backend with hooks to add/remove
const possibleTopics: string[] = [
  "plumeage",
  "dietary habits",
  "mating rituals",
  "natural predators",
  "bird call",
  "natural habitat",
  "beak",
  "talons",
  "wings",
  "wingspan",
  "migratory habits",
  "egg laying habits",
  "relationship to humans",
  "special abilities",
  "camoflauge",
  "magical powers",
  "elemental affinities",
  "social life",
  "pecking order",
  "coffee or tea preference",
  "internet controversies",
  "social media presence",
  "favorite game to stream"
]

export default class BirdFactApi {
  private readonly nuthatchUtils: NuthatchUtils;
  private readonly openAiUtils: OpenApiUtils;
  private readonly db: DbUtils;
  private readonly modules: ScriptModules;
  private readonly prefix: string;
  private readonly base: string;
  private readonly dbFactPath: string;

  constructor(modules: ScriptModules) {
    this.nuthatchUtils = new NuthatchUtils(modules);
    this.openAiUtils = new OpenApiUtils(modules);
    this.db = new DbUtils("./db/birbFacts.db", modules);
    this.modules = modules;

    this.prefix = "oceanity";
    this.base = "/birdFacts";
    this.dbFactPath = "/facts";
  }

  public setup = async () => {
    this.modules.logger.info("Setting up BirdFactApi...");
    await this.db.setup();
    await this.nuthatchUtils.setup();
    await this.registerEndpoints();
  }

  private registerEndpoints = async () => {
    const { modules, prefix, base } = this;
    const { httpServer } = modules;

    httpServer.registerCustomRoute(prefix, base, "PUT", this.putNewBirdFactHandler);
    httpServer.registerCustomRoute(prefix, base, "GET", this.getBirdFactHandler);
  }

  private putNewBirdFactHandler = async (req: Request, res: Response) => {
    const birdResponse = await this.nuthatchUtils.getRandomBird();
    const topic = getRandomItem<string>(possibleTopics);
    const count = await this.db.count(this.dbFactPath);

    const chatResponse = await this.openAiUtils.chatCompletion([
      { role: "system", content: "You are a female ornithologist who doesn't actually know as much about birds as you think, but will confidently state incorrect facts about them." },
      { role: "user", content: `Can you give me a made up and outlandish fact about the ${birdResponse.name}'s ${topic}. Limit your response to a few sentences in a single line of text that sticks to the facts and doesn't include any unnecessary commentary responding to the question asked like starting with "Sure", "Certainly", "Did you know that" or "Of course"` }
    ]);

    const newFact: BirbFact = {
      id: count + 1,
      bird: {
        name: birdResponse.name,
        id: birdResponse.id,
        sciName: birdResponse.sciName,
        family: birdResponse.family,
        order: birdResponse.order
      },
      topic,
      message: chatResponse.choices.pop()?.message.content?.replace(/[\s\r\n]+/ig, " ").trim() ?? ""
    }

    this.db.push<BirbFact[]>(this.dbFactPath, [newFact], false);

    res.send(newFact);
  }

  private getBirdFactHandler = async (req: Request, res: Response) => {
    const { id } = getRequestDataFromUri(req.url).params;
    const index = id ? parseInt(id) - 1 : -1;

    const facts = await this.db.get<BirbFact[]>("/facts") ?? [];
    const fact = index != -1 && index < facts.length ? facts[index] : getRandomItem<BirbFact>(facts);

    res.send(fact);
  }
}
