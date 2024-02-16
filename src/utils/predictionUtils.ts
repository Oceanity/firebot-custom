import {
  Prediction,
  PredictionLibrary,
  PredictionOptions,
  PredictionClass,
  CreatePredictionResponse,
  CreatePredictionRequest,
} from "@t/predictions";
import { getRandomItem } from "@u/array";
import DbUtils from "./dbUtils";
import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";

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
  public async getAll(): Promise<PredictionLibrary> {
    const { logger } = this.modules;

    if (!this.db.isReady()) {
      logger.error(`Prediction Db is not ready, cannot getAll()`);
      return null;
    }

    const defaults: PredictionLibrary = {};
    return await this.db.get<PredictionLibrary>("/predictions", defaults);
  }

  /**
   * Gets saved PredictionOptions from db saved to `slug`
   * @param {string} slug Key where PredictionOptions are saved in the db
   * @returns {PredictionOptions} PredictionOptions retrieved from db at key `slug`
   */
  public async getPredictionOptions(slug: string): Promise<PredictionOptions> {
    if (!this.isDbReady(`getPredictionOptions(${slug})`)) return null;

    const defaults: PredictionOptions = {
      titleChoices: [],
      outcomeChoices: [],
    };
    return await this.db.get<PredictionOptions>(`/predictions/${slug}`, defaults);
  }

  /**
   * Returns a randomized Prediction based on data saved in db
   * @param {string} slug Key where PredictionOptions are saved in the db
   * @returns {Prediction} Randomized Prediction object
   */
  public async getRandomPrediction(slug: string): Promise<Prediction> {
    if (!this.isDbReady(`getRandomPrediction(${slug})`)) return null;

    const options: PredictionOptions = await this.getPredictionOptions(slug);
    if (!this.isPredictionOptionsValid(options, slug)) return null;

    const response: Prediction = new PredictionClass();

    response.title = getRandomItem<string>(options.titleChoices);

    for (const outcomeSet of options.outcomeChoices) {
      response.outcomes.push({
        title: getRandomItem<string>(outcomeSet)
      });
    }

    return response;
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
   * Checks if provided PredictionOptions are valid
   * @param {PredictionOptions} options PredictionOptions to validate
   * @param {string?} slug (Optional) Name of slug to include in logger output
   * @returns {boolean} `true` if `options` are valid PredictionOptions
   */
  private isPredictionOptionsValid = (options: PredictionOptions, slug?: string): boolean => {
    const { logger } = this.modules;
    const slugString = slug ? ` with slug ${slug}` : "";

    if (!options) {
      logger.error(`No PredictionOptions found${ slugString }`);
      return false;
    }

    if (!options.titleChoices.length) {
      logger.error(`No titleChoices found on PredictionOptions${ slugString }`);
      return false;
    }

    if (options.outcomeChoices.length < 2) {
      logger.error(`Prediction${ slugString } does not have enough outcomes`);
      return false;
    }

    return true;
  }
}

export const predictions: PredictionLibrary = {
  swampSpiderHouse: {
    titleChoices: [
      "Squamp? (Items in SSH)",
      "Squamp??? (Items in SSH)",
      "Romp in the Squamp (Items in SSH)"
    ],
    outcomeChoices: [
      ["SQUAMP (2+)", "Totem PROVIDES (2+)", "MAX SQUAMP (2+)"],
      ["squamp (1)", "Lil' Squampy (1)"],
      ["Squampn't (0)", "Swamp Spider House (0)"],
    ],
  },
  oceanSpiderHouse: {
    titleChoices: ["Oshi's House (Items in OSH)"],
    outcomeChoices: [
      ["Oshi Cute (2+)"],
      ["Cute birb (1)"],
      ["Nobody's Home (0)"]
    ],
  },
  graveyard: {
    titleChoices: ["Party at the Graveyard (Items in Graveyard)"],
    outcomeChoices: [["Monster Mash (1+)"], ["Graveyard Smash (0)"]],
  },
  circlinBird: {
    titleChoices: ["Circlin' Bird (Items in Termina Bird)"],
    outcomeChoices: [
      ["Circle (1+)", "🔵 (1+)"],
      ["Square (0)", "🟦 (0)"],
    ],
  },
};

export const getRandomPrediction = (slug: string, broadcaster_id: string): CreatePredictionResponse => {
  if (!isValidPredictionSlug) {
    return {
      status: 409,
      message: slug ? `No prediction with slug ${slug}` : `Required param \`slug\` missing`,
    };
  }
  const { titleChoices, outcomeChoices } = predictions[slug];
  const predictionRequest: CreatePredictionRequest = {
    broadcaster_id,
    title: getRandomItem<string>(titleChoices),
    outcomes: [],
    prediction_window: 300,
  };

  for (const o of outcomeChoices) {
    predictionRequest.outcomes.push({
      title: getRandomItem<string>(o),
    });
  }

  return {
    status: 200,
    predictionRequest,
  };
};

export const isValidPredictionSlug = (slug: string): boolean => slug && predictions[slug] != null;
