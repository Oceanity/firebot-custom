import { Request, Response } from "express";
import { getRequestDataFromUri } from "@u/requestUtils";
import PredictionUtils from "@u/predictionUtils";
import { CreatePredictionOptionsRequest, CreatePredictionRequest } from "@t/predictions";
import store from "@u/global";

export default class PredictionApi {
  private predictions: PredictionUtils;
  private readonly route: string = "/predictions";

  /**
   * Instantiates Prediction API class
   * @param {string} path Path to save Predictions.db file
   * @param {ScriptModules} modules ScriptModules reference
   */
  constructor(path: string = "./db/predictions.db") {
    this.predictions = new PredictionUtils(path);
  }

  /**
   * Initializes DbUtils and registers endpoints
   */
  setup = async (): Promise<void> => {
    await this.predictions.setup();
    await this.registerEndpoints();
  };

  /**
   * Registers Prediction endpoints to Firebot's HttpServer
   * @returns {boolean} `true` if operation was successful
   */
  private registerEndpoints = async (): Promise<boolean> => {
    const { route } = this;
    const { modules, prefix } = store;
    const { httpServer } = modules;

    let response = true;

    response &&= httpServer.registerCustomRoute(prefix, route, "GET", this.getPredictionHandler);
    response &&= httpServer.registerCustomRoute(prefix, route, "POST", this.postPredictionHandler);
    response &&= httpServer.registerCustomRoute(prefix, `${route}/titles`, "GET", this.getPredictionTitlesHandler);

    return response;
  };

  /**
   * Unregisters Prediction Endpoints from Firebot's HttpServer
   * @returns {boolean} `true` if operation was successful
   */
  unregisterEndpoints = async (): Promise<boolean> => {
    const { route } = this;
    const { modules, prefix } = store;
    const { httpServer } = modules;

    let response = true;

    response &&= httpServer.unregisterCustomRoute(prefix, route, "GET");
    response &&= httpServer.unregisterCustomRoute(prefix, route, "POST");
    response &&= httpServer.unregisterCustomRoute(prefix, `${route}/titles`, "GET");

    return response;
  };

  /**
   * GET : /oceanity/predictions
   */
  private getPredictionHandler = async (req: Request, res: Response): Promise<void> => {
    const { predictions } = this;
    const { slug, broadcaster_id } = getRequestDataFromUri(req.url).params;

    const response = await predictions.getRandomPrediction(slug);

    if (!response) throw `Could not get random prediction from slug ${slug}`;
    if (response.status != 200) throw `Error ${response.status}: ${response.message}`;

    const predictionResponse: CreatePredictionRequest = {
      ...response.prediction,
      broadcaster_id,
      prediction_window: 300,
    };

    res.send(predictionResponse);
  };

  /**
   * POST : /oceanity/predictions
   */
  private postPredictionHandler = async (req: Request, res: Response) => {
    const { predictions } = this;
    const { slug, titleChoices, outcomeChoices } = req.body as CreatePredictionOptionsRequest;

    predictions.pushPredictionOptions(slug, { titleChoices, outcomeChoices });

    res.send(true);
  };

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
      count: titleChoices.length,
    });
  };
}
