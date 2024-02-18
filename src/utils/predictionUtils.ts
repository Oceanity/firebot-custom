import {
  Prediction,
  PredictionLibrary,
  PredictionOptions,
  PredictionOptionsResponse,
  PredictionResponse,
} from "@t/predictions";
import { getRandomItem } from "@u/array";
import DbUtils from "./dbUtils";
import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import {
  Respond409Conflict,
  Respond503ServiceUnavailable
} from "@t/apiResponses";

export default class PredictionUtils {
  private readonly db: DbUtils;
  private readonly modules: ScriptModules;

  /**
   * Instantiates PredictionUtils class
   * @param {string} path Relative path to save db to
   * @param {ScriptModules} modules ScriptModules reference
   */
  constructor(path: string, modules: ScriptModules) {
    this.db = new DbUtils(path, modules);
    this.modules = modules;
  }

  /**
   * Initializes DbUtils
   */
  public async setup(): Promise<void> {
    await this.db.setup();
  }

  /**
   * Gets all Predictions in db as PredictionLibrary
   * @returns {Promise<PredictionLibrary>} all Predictions stored in db as PredictionLibrary
   */
  public async getAll(): Promise<PredictionLibrary | undefined> {
    const { logger } = this.modules;

    if (!this.db.isReady()) {
      logger.error(`Prediction Db is not ready, cannot getAll()`);
      return undefined;
    }

    const defaults: PredictionLibrary = {};
    return await this.db.get<PredictionLibrary>("/predictions", defaults);
  }

  /**
   * Gets saved PredictionOptions from db saved to `slug`
   * @param {string} slug Key where PredictionOptions are saved in the db
   * @returns {PredictionOptions} PredictionOptions retrieved from db at key `slug`
   */
  public async getPredictionOptions(slug: string): Promise<PredictionOptionsResponse> {
    if (!this.isDbReady(`getPredictionOptions(${slug})`))
      return Respond409Conflict("Prediction Db not ready") as PredictionOptionsResponse;

    const options = await this.db.get<PredictionOptions>(`/${slug}`);

    return  {
        status: options ? 200 : 404,
        message: `Could not get prediction options for slug "${slug}"`,
        options
      }
  }

  /**
   * Push PredictionOptions to db at provided slug
   * @param {string} slug Key where PredictionOptions are saved to the db
   * @param {PredictionOptions} options PredictionOptions to save to the db
   * @returns {boolean} `true` if operation completed successfully
   */
  public async pushPredictionOptions(slug: string, options: PredictionOptions): Promise<boolean> {
    if (!this.isPredictionOptionsValid(options)) return false;

    return await this.db.push<PredictionOptions>(`/${slug}`, options);
  }

  /**
   * Returns a randomized Prediction based on data saved in db
   * @param {string} slug Key where PredictionOptions are saved in the db
   * @returns {Prediction} Randomized Prediction object
   */
  public async getRandomPrediction(slug: string): Promise<PredictionResponse | undefined> {
    if (!this.isDbReady(`getRandomPrediction(${slug})`))
      return Respond503ServiceUnavailable("Prediction Db not ready") as PredictionResponse;

    const response: PredictionOptionsResponse = await this.getPredictionOptions(slug);
    if (response.status != 200 || !response.options || !this.isPredictionOptionsValid(response.options)) return undefined;

    const { titleChoices, outcomeChoices } = response.options;
    const prediction: Prediction = {
      title: getRandomItem<string>(titleChoices) ?? "",
      outcomes: outcomeChoices
        .filter(o => o.length)
        .map(o => ({ title: getRandomItem<string>(o) ?? "" }))
    }

    return {
      status: this.isPredictionValid(prediction) ? 200 : 409,
      prediction
    }
  }


  /**
   * Checks to ensure DbUtils has completed setup and can be used
   * @param {string?} method (Optional) Name of method to include in logger output
   * @returns {boolean} `true` if `db` has completed `setup()`
   */
  private isDbReady = (method?: string): boolean => {
    const { logger } = this.modules;

    if (!this.db.isReady()) {
      logger.error(`Prediction Db is not ready, cannot complete method ${method}`);
      return false;
    }

    return true;
  }

  /**
   * Checks if provided Prediction is valid
   * @param {Prediction} prediction Prediction to validate
   * @returns {boolean} `true` if `prediction` is valid Prediction
   */
  private isPredictionValid = (prediction: Prediction): boolean =>
    prediction
    && prediction.title.length != 0
    && prediction.outcomes.length > 1;

  /**
   * Checks if provided PredictionOptions are valid
   * @param {PredictionOptions} options PredictionOptions to validate
   * @param {string?} slug (Optional) Name of slug to include in logger output
   * @returns {boolean} `true` if `options` are valid PredictionOptions
   */
  private isPredictionOptionsValid = (options: PredictionOptions): boolean =>
    options
    && options.titleChoices.length != 0
    && options.outcomeChoices.filter(o =>
      o.length
    ).length > 1
}
