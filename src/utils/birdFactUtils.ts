import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import DbUtils from "./dbUtils";
import { BirdFact } from "@t/birdFacts";
import OpenApiUtils from "./openAiUtils";
import NuthatchUtils from "./nuthatchUtils";
import iNaturalistUtils from "./iNaturalistUtils";

export default class BirdFactUtils {
  private readonly modules: ScriptModules;
  private readonly db: DbUtils;
  private readonly openAi: OpenApiUtils;
  private readonly nuthatch: NuthatchUtils;
  private readonly iNat: iNaturalistUtils;

  private readonly factPath: string;
  private readonly loadingMessagePath: string;
  private readonly topicsPath: string

  constructor(modules: ScriptModules, path: string = "./db/birbFacts.db") {
    modules.logger.info(path);
    this.modules = modules;
    this.db = new DbUtils(modules, path);
    this.openAi = new OpenApiUtils(modules)
    this.nuthatch = new NuthatchUtils(modules);
    this.iNat = new iNaturalistUtils();

    this.factPath = "/facts";
    this.loadingMessagePath = "/loadingMessages";
    this.topicsPath = "/topics";
  }

  public setup = async (): Promise<void> => {
    await this.db.setup();
    await this.nuthatch.setup();
  }

  public putBirdFact = async (): Promise<BirdFact> => {
    const { openAi } = this;
    const topic = await this.getRandomTopic();
    this.modules.logger.info(topic);
    const bird = await this.nuthatch.getRandomBird();
    if (!bird) throw "Could not get Bird from Nuthatch API!";
    this.modules.logger.info(JSON.stringify(bird));

    const iNatData = await iNaturalistUtils.getBirdInfo(bird.sciName, this.modules);
    this.modules.logger.info(JSON.stringify(iNatData));

    const chatResponse = await openAi.chatCompletion([
      { role: "system", content: "You are a female ornithologist who doesn't actually know as much about birds as you think, but will confidently state incorrect facts about them." },
      { role: "user", content: `Can you give me a made up and outlandish fact about the ${bird.name}'s ${topic ?? "most interesting features"}. Limit your response to a few sentences in a single line of text that sticks to the facts and doesn't include any unnecessary commentary responding to the question asked like starting with "Sure", "Certainly", "Did you know that" or "Of course"` }
    ]);
    this.modules.logger.info(JSON.stringify(chatResponse));

    const count = await this.db.count(this.factPath) ?? 0;
    this.modules.logger.info(`${count}`);

    const newFact: BirdFact = {
      id: count + 1,
      bird: {
        name: bird.name,
        id: bird.id,
        sciName: bird.sciName,
        family: bird.family,
        order: bird.order
      },
      iNatData,
      topic,
      message: chatResponse.choices.pop()?.message.content?.replace(/[\s\r\n]+/ig, " ").trim() ?? ""
    }
    this.modules.logger.info(JSON.stringify(newFact));

    await this.db.push<BirdFact[]>(this.factPath, [newFact], false);
    this.modules.logger.info("Pushed new Bird Fact");
    return newFact;
  }

  public getAllBirdFacts = async (): Promise<BirdFact[]> =>
    await this.db.get<BirdFact[]>(this.factPath) ?? [];

  public getBirdFact = async (id?: number): Promise<BirdFact | undefined> =>
    id && await this.db.isInBounds(this.factPath, id - 1) ? (await this.db.get<BirdFact[]>(this.factPath) ?? [])[id - 1] : this.db.getRandom<BirdFact>(this.factPath);

  //#region Loading Message Functions
  public pushLoadingMessage = async (message: string): Promise<boolean> =>
    await this.db.push(this.loadingMessagePath, [message]);

  public getAllLoadingMessages = async (): Promise<string[]> =>
    await this.db.get<string[]>(this.loadingMessagePath) ?? [];

  public getRandomLoadingMessage = async (): Promise<string> =>
    await this.db.getRandom<string>(this.loadingMessagePath) ?? "Generating new birb fact...";

  public updateLoadingMessage = async (oldMessage: string, newMessage: string): Promise<boolean> => {
    const oldCount = await this.db.count(this.loadingMessagePath);
    const response = await this.db.filter(this.loadingMessagePath, m => m === oldMessage ? newMessage : m);
    if (!response || oldCount == await this.db.count(this.loadingMessagePath)) return false;
    return await this.db.push<string>(this.loadingMessagePath, newMessage);
  }

  public deleteLoadingMessage = async (message: string): Promise<string | undefined> =>
    await this.db.delete<string>(this.loadingMessagePath, message);
  //#endregion

  //#region Topic Functions
  public pushTopic = async (topic: string): Promise<boolean> =>
    await this.db.push(this.topicsPath, [topic]);

  public getAllTopics = async (): Promise<string[]> =>
    await this.db.get<string[]>(this.topicsPath) ?? [];

  public getRandomTopic = async (): Promise<string> =>
    await this.db.getRandom<string>(this.topicsPath, []) ?? "most interesting attributes";

  public deleteTopic = async (topic: string): Promise<string | undefined> =>
    await this.db.delete<string>(this.topicsPath, topic);
  //#endregion
}
