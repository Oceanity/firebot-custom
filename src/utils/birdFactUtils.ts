// import DbUtils from "./dbUtils";
import { BirdFact } from "@t/birdFacts";
import openAi from "./openAiUtils";
import NuthatchUtils from "./nuthatchUtils";
import iNaturalistUtils from "./iNaturalistUtils";
import BirdFactTopicUtils from "./birdFactTopicUtils";

export default class BirdFactUtils {
  // private readonly db: DbUtils; want to move DB away from Bird utils to keep things less tangled
  private readonly nuthatch: NuthatchUtils;
  private readonly path: string = "/facts"

  constructor() {
    // this.db = new DbUtils(path);
    this.nuthatch = new NuthatchUtils();
  }

  setup = async (): Promise<void> => {
    // await this.db.setup();
    await this.nuthatch.setup();
  }

  createNew = async (id?: number): Promise<BirdFact> => {
    const topic = await BirdFactTopicUtils.fetch() ?? "most interesting features";
    const bird = await this.nuthatch.getRandomBird();

    if (!bird) throw "Could not get Bird from Nuthatch API!";

    const iNatData = await iNaturalistUtils.getBirdInfo(bird.name);

    const chatResponse = await openAi.chatCompletion([
      { role: "system", content: "You are a female ornithologist who doesn't actually know as much about birds as you think, but will confidently state incorrect facts about them." },
      { role: "user", content: `Can you give me a made up and outlandish fact about the ${bird.name}'s ${topic}. Limit your response to a few sentences in a single line of text that sticks to the facts and doesn't include any unnecessary commentary responding to the question asked like starting with "Sure", "Certainly", "Did you know that" or "Of course"` }
    ]);

    //const count = await this.db.count(this.path) ?? 0;

    const newFact: BirdFact = {
      id,
      bird: {
        name: bird.name,
        id: bird.id,
        sciName: bird.sciName,
        family: bird.family,
        order: bird.order
      },
      iNatData,
      topic,
      message: chatResponse?.message.content?.replace(/[\s\r\n]+/ig, " ").trim() ?? ""
    }

    return newFact;
  }

  /*getAllBirdFacts = async (): Promise<BirdFact[]> =>
    await this.db.get<BirdFact[]>(this.path) ?? [];

  getBirdFact = async (id?: number): Promise<BirdFact | undefined> =>
    id && await this.db.isInBounds(this.path, id - 1) ? (await this.db.get<BirdFact[]>(this.path) ?? [])[id - 1] : this.db.getRandom<BirdFact>(this.path);*/
}
