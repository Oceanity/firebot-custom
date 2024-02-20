import NuthatchUtils from "@/utils/nuthatchUtils";
import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { Request, Response } from "express";
import * as dotenv from "dotenv";
import OpenApiUtils from "@/utils/openAiUtils";
import { CreateLoadingMessageRequest } from "@t/birdFacts";
import { getRequestDataFromUri } from "@/utils/requestUtils";
import BirdFactUtils from "@/utils/birdFactUtils";
import { getRandomItem } from "@/utils/array";
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
  "feet",
  "talons",
  "wings",
  "wingspan",
  "flying speed",
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
  private readonly birdFactUtils: BirdFactUtils;
  private readonly nuthatchUtils: NuthatchUtils;
  private readonly openAiUtils: OpenApiUtils;
  //private readonly db: DbUtils;
  private readonly modules: ScriptModules;
  private readonly prefix: string;
  private readonly base: string;
  private readonly dbFactPath: string;

  constructor(modules: ScriptModules) {
    this.birdFactUtils = new BirdFactUtils(modules);
    this.nuthatchUtils = new NuthatchUtils(modules);
    this.openAiUtils = new OpenApiUtils(modules);
    //this.db = new DbUtils(modules, "./db/birbFacts.db");
    this.modules = modules;

    this.prefix = "oceanity";
    this.base = "/birdFacts";
    this.dbFactPath = "/facts";
  }

  public setup = async () => {
    this.modules.logger.info("Setting up BirdFactApi...");
    await this.birdFactUtils.setup();
    //await this.db.setup();
    await this.nuthatchUtils.setup();
    await this.registerEndpoints();
  }

  private registerEndpoints = async () => {
    const { modules, prefix, base } = this;
    const { httpServer } = modules;

    httpServer.registerCustomRoute(prefix, base, "PUT", this.putNewBirdFactHandler);
    httpServer.registerCustomRoute(prefix, base, "GET", this.getBirdFactHandler);

    httpServer.registerCustomRoute(prefix, `${base}/loadingMessages`, "PUT", this.putNewLoadingMessageHandler);
    httpServer.registerCustomRoute(prefix, `${base}/loadingMessages`, "GET", this.getLoadingMessageHandler);
  }

  private putNewBirdFactHandler = async (req: Request, res: Response) => {
    const bird = await this.nuthatchUtils.getRandomBird();
    const topic = getRandomItem<string>(possibleTopics);
    const newFact = await this.birdFactUtils.putBirdFact(this.openAiUtils, bird, topic);
    res.send(newFact);
  }

  private getBirdFactHandler = async (req: Request, res: Response) => {
    const { id } = getRequestDataFromUri(req.url).params;
    const fact = await this.birdFactUtils.getBirdFact(parseInt(id));
    res.send(fact);
  }

  private getLoadingMessageHandler = async (req: Request, res: Response): Promise<string> => {
    const response = await this.birdFactUtils.getRandomLoadingMessage();
    res.send(response);
    return response;
  }

  private putNewLoadingMessageHandler = async (req: Request, res: Response): Promise<boolean> => {
    const { message } = req.body as CreateLoadingMessageRequest;
    const response = await this.birdFactUtils.pushRandomLoadingMessage(message);
    res.send(response);
    return response;
  }
}
