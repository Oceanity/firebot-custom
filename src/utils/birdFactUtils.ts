import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import DbUtils from "./dbUtils";
import { getRandomItem } from "./array";
import { Bird, BirdFact } from "@t/birdFacts";
import OpenApiUtils from "./openAiUtils";

export default class BirdFactUtils {
  private readonly modules: ScriptModules;
  private readonly db: DbUtils;

  private readonly factPath: string;
  private readonly loadingMessagePath: string;

  constructor(modules: ScriptModules, path: string = "./db/birbFacts.db") {
    modules.logger.info(path);
    this.modules = modules;
    this.db = new DbUtils(modules, path);

    this.factPath = "/facts";
    this.loadingMessagePath = "/loadingMessages";
  }

  public setup = async (): Promise<void> => {
    await this.db.setup();
  }

  public putBirdFact = async (openAi: OpenApiUtils, bird: Bird, topic?: string): Promise<BirdFact> => {
    const chatResponse = await openAi.chatCompletion([
      { role: "system", content: "You are a female ornithologist who doesn't actually know as much about birds as you think, but will confidently state incorrect facts about them." },
      { role: "user", content: `Can you give me a made up and outlandish fact about the ${bird.name}'s ${topic ?? "most interesting features"}. Limit your response to a few sentences in a single line of text that sticks to the facts and doesn't include any unnecessary commentary responding to the question asked like starting with "Sure", "Certainly", "Did you know that" or "Of course"` }
    ]);
    const count = await this.db.count(this.factPath);

    const newFact: BirdFact = {
      id: count + 1,
      bird: {
        name: bird.name,
        id: bird.id,
        sciName: bird.sciName,
        family: bird.family,
        order: bird.order
      },
      topic,
      message: chatResponse.choices.pop()?.message.content?.replace(/[\s\r\n]+/ig, " ").trim() ?? ""
    }
    this.db.push<BirdFact[]>(this.factPath, [newFact], false);

    return newFact;
  }

  public getBirdFact = async (id?: number): Promise<BirdFact | undefined> =>
    id && await this.db.isInBounds(this.factPath, id - 1) ? (await this.db.get<BirdFact[]>(this.factPath) ?? [])[id - 1] : this.db.getRandom<BirdFact>(this.factPath);

  public getRandomLoadingMessage = async (): Promise<string> =>
    getRandomItem<string>(await this.db.get<string[]>(this.loadingMessagePath) ?? []) ?? "Generating new birb fact...";

  public pushRandomLoadingMessage = async (message: string): Promise<boolean> =>
    await this.db.push(this.loadingMessagePath, [message], false);

  public deleteRandomLoadingMessage = async (message: string): Promise<boolean> =>
    await this.db.filter(this.loadingMessagePath, m => m !== message);
}
