import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { Request, Response } from "express";
import { getRequestDataFromUri } from "@u/requestUtils";
import PredictionUtils from "@u/predictionUtils";
import { CreatePredictionOptionsRequest, CreatePredictionRequest } from "@t/predictions";
import { resolve } from "path";

export default class PredictionApi {
  private predictions: PredictionUtils;
  private modules: ScriptModules;

  private readonly prefix: string = "oceanity";
  private readonly base: string = "/predictions";

  /**
   * Instantiates Prediction API class
   * @param {string} path Path to save Predictions.db file
   * @param {ScriptModules} modules ScriptModules reference
   */
  constructor(
    path: string = resolve(__dirname, "./db/predictions.db"),
    modules: ScriptModules,
  ) {
    this.modules = modules;
    this.predictions = new PredictionUtils(path, modules);
  }

  /**
   * Initializes DbUtils and registers endpoints
   */
  public async setup(): Promise<void> {
    await this.predictions.setup();
    await this.registerEndpoints();
  }

  /**
   * Registers Prediction endpoints to Firebot's HttpServer
   * @returns {boolean} `true` if operation was successful
   */
  private async registerEndpoints(): Promise<boolean> {
    const { modules, prefix, base } = this;
    const { httpServer, logger } = modules;

    let response = true;

    logger.info("Registering Prediction Endpoints....");
    response &&= httpServer.registerCustomRoute(prefix, base, "GET", this.getPredictionHandler);
    response &&= httpServer.registerCustomRoute(prefix, base, "POST", this.postPredictionHandler);
    response &&= httpServer.registerCustomRoute(prefix, `${base}/titles`, "GET", this.getPredictionTitlesHandler);

    return response;
  }

  /**
   * Unregisters Prediction Endpoints from Firebot's HttpServer
   * @returns {boolean} `true` if operation was successful
   */
  public async unregisterEndpoints(): Promise<boolean> {
    const { modules, prefix, base } = this;
    const { httpServer, logger } = modules;

    let response = true;

    logger.info("Unregistering Prediction Endpoints...");
    response &&= httpServer.unregisterCustomRoute(prefix, base, "GET");
    response &&= httpServer.unregisterCustomRoute(prefix, base, "POST");
    response &&= httpServer.unregisterCustomRoute(prefix, `${base}/titles`, "GET");

    return response;
  }

  /**
   * GET : /oceanity/predictions
   */
  private getPredictionHandler = async (req: Request, res: Response): Promise<void> => {
    const { modules, predictions } = this;
    const { slug, broadcaster_id } = getRequestDataFromUri(req.url).params;

    modules.logger.info("Getting random Prediction...");
    const response = await predictions.getRandomPrediction(slug);

    if (!response) {
      modules.logger.info(`Could not get random prediction from slug ${slug}`);
      return;
    }

    if (response.status != 200) {
      modules.logger.error(`Error ${response.status}: ${response.message}`);
      return;
    }

    modules.logger.info(`Pulled prediction ${response.prediction.title}`);

    const predictionResponse: CreatePredictionRequest = {
      ...response.prediction,
      broadcaster_id,
      prediction_window: 300
    }

    res.send(predictionResponse);
  }

  /**
   * POST : /oceanity/predictions
   */
  private postPredictionHandler = async (req: Request, res: Response) => {
    const { predictions } = this;
    const { slug, titleChoices, outcomeChoices } = req.body as CreatePredictionOptionsRequest;

    predictions.pushPredictionOptions(slug, { titleChoices, outcomeChoices });

    res.send(true);
  }

  /**
   * GET : /oceanity/predictions/titles?slug=<slug>
   */
  private getPredictionTitlesHandler = async (req: Request, res: Response) => {
    const { predictions } = this;
    const { slug } = getRequestDataFromUri(req.url).params;

    const response = await predictions.getPredictionOptions(slug);

    if (!response.options) {
      res.send(response);
      return false;
    }

    const { titleChoices } = response.options;

    res.send({
      status: response.status,
      titles: titleChoices,
      count: titleChoices.length
    });
  }
}
