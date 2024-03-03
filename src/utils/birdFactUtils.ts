import { BirdFact } from "@t/birdFacts";
import topics from "@u/birdFactTopicUtils";
import iNaturalistUtils from "@u/iNaturalistUtils";
import nuthatch from "@u/nuthatchUtils";
import openAi from "@u/openAiUtils";

/**
 * Utility class for generating bird facts using the OpenAI chat API.
 */
export default class BirdFactUtils {
  /**
   * Generates a new bird fact using the OpenAI chat API.
   * @param id Optional ID to use for the new fact. If not provided, will generate a new random number.
   * @returns A new bird fact with the given ID or a randomly generated one.
   */
  static async generateNewFactAsync(id?: number): Promise<BirdFact> {
    const topic = await topics.getRandomTopicAsync();
    const bird = await nuthatch.getRandomBirdAsync();

    if (!bird) throw "Could not get Bird from Nuthatch API!";

    const iNatData = await iNaturalistUtils.getBirdInfo(bird.name);

    const chatResponse = await openAi.chatCompletion([
      { role: "system", content: "You are a female ornithologist who doesn't actually know as much about birds as you think, but will confidently state incorrect facts about them. You avoid talking about mating rituals and mating season unless it is directly relevant to the fact you are talking about." },
      { role: "user", content: `Can you give me a made up and outlandish fact about the ${bird.name}'s ${topic}. Limit your response to a few sentences in a single line of text that sticks to the facts and doesn't include any unnecessary commentary responding to the question asked like starting with "Sure", "Certainly", "Did you know that" or "Of course"` }
    ]);

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
    await this.db.getAsync<BirdFact[]>(this.path) ?? [];

  getBirdFact = async (id?: number): Promise<BirdFact | undefined> =>
    id && await this.db.isInBounds(this.path, id - 1) ? (await this.db.getAsync<BirdFact[]>(this.path) ?? [])[id - 1] : this.db.getRandom<BirdFact>(this.path);*/
}
