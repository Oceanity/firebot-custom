import { Prediction, PredictionLibrary, PredictionOptions } from "@t/predictions";
import { getRandomItem } from "@u/array";
import db from "@/utils/dbUtils";

/**
 * Utility class for working with predictions
 */
export default class PredictionUtils {
  private static readonly path = "./db/predictions";
  private static readonly defaultVals: PredictionLibrary = {};

  /**
   * Returns all the predictions from the database
   * @returns The predictions or undefined if there was an error
   */
  static getAllPredictionsAsync = async (): Promise<PredictionLibrary | undefined> =>
    await db.getAsync<PredictionLibrary>(this.path, "/", this.defaultVals);

  /**
   * Returns the prediction options for a given slug
   * @param slug The slug of the prediction
   * @returns The prediction options or undefined if there was an error
   */
  static getPredictionOptionsAsync = async (slug: string): Promise<PredictionOptions | undefined> =>
    await db.getAsync<PredictionOptions>(this.path, `/${slug}`);

  /**
   * Adds the prediction options to the database for a given slug
   * @param slug The slug of the prediction
   * @param options The prediction options to add
   * @returns True if the options were added successfully, false otherwise
   */
  static addPredictionOptionsAsync = async (slug: string, options: PredictionOptions): Promise<boolean> =>
    this.isPredictionOptionsValid(options) ? await db.push<PredictionOptions>(this.path, `/${slug}`, options) : false;

  /**
   * Returns a random prediction from the database for a given slug
   * @param slug The slug of the prediction
   * @returns The random prediction or undefined if there was an error
   */
  static async getRandomPredictionAsync(slug: string): Promise<Prediction | undefined> {
    const response = await this.getPredictionOptionsAsync(slug);

    if (!response || !this.isPredictionOptionsValid(response)) return undefined;

    const { outcomeChoices, titleChoices } = response;
    const prediction: Prediction = {
      title: getRandomItem<string>(titleChoices) ?? "",
      outcomes: outcomeChoices.filter((o) => o.length).map((o) => ({ title: getRandomItem<string>(o) ?? "" })),
    };

    return prediction;
  }

  /**
   * Determines if the given prediction is valid
   * @param prediction The prediction to validate
   * @returns True if the prediction is valid, false otherwise
   */
  private static isPredictionValid = (prediction: Prediction): boolean =>
    prediction && prediction.title.length != 0 && prediction.outcomes.length > 1;

  /**
   * Determines if the given prediction options are valid
   * @param options The prediction options to validate
   * @returns True if the options are valid, false otherwise
   */
  private static isPredictionOptionsValid = (options: PredictionOptions): boolean =>
    options && options.titleChoices.length != 0 && options.outcomeChoices.filter((o) => o.length).length > 1;
}
