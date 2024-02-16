import {
  Prediction,
  PredictionLibrary,
  PredictionOptions,
  CreatePredictionResponse,
  CreatePredictionRequest,
} from "@t/predictions";
import { getRandomString } from "@u/array";
import DbHelper from "./dbUtils";
import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";

export default class PredictionHelper {
  private readonly db: DbHelper;
  private readonly modules: ScriptModules;
  private library: PredictionLibrary;

  constructor(path: string, modules: ScriptModules) {
    this.db = new DbHelper(path, modules);
    this.modules = modules;
  }

  /**
   * Initializes DbHelper and fills library
   */
  public async setup(): Promise<void> {
    await this.db.setup();
    this.library = await this.getAll();
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
    const { logger } = this.modules;

    if (!this.db.isReady()) {
      logger.error(
        `Prediction Db is not ready, cannot getPredictionOptions(${slug})`,
      );
      return null;
    }

    const defaults: PredictionOptions = {
      titleChoices: [],
      outcomeChoices: [],
    };
    return await this.db.get<PredictionOptions>(
      `/predictions/${slug}`,
      defaults,
    );
  }
}

export const predictions: PredictionLibrary = {
  swampSpiderHouse: {
    titleChoices: [
      "Squamp? (Items in SSH)",
      "Squamp??? (Items in SSH)",
      "Romp in the Squamp (Items in SSH)",
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
      ["Nobody's Home (0)"],
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

export const getRandomPrediction = (
  slug: string,
  broadcaster_id: string,
): CreatePredictionResponse => {
  if (!isValidPredictionSlug) {
    return {
      status: 409,
      message: slug
        ? `No prediction with slug ${slug}`
        : `Required param \`slug\` missing`,
    };
  }
  const { titleChoices, outcomeChoices } = predictions[slug];
  const predictionRequest: CreatePredictionRequest = {
    broadcaster_id,
    title: getRandomString(titleChoices),
    outcomes: [],
    prediction_window: 300,
  };

  for (let o of outcomeChoices) {
    predictionRequest.outcomes.push({
      title: getRandomString(o),
    });
  }

  return {
    status: 200,
    predictionRequest,
  };
};

export const isValidPredictionSlug = (slug: string): boolean =>
  slug && predictions.hasOwnProperty(slug);
