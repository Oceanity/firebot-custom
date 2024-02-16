import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { Request, Response } from "express";
import { getRequestDataFromUri } from "@u/requestUtils";
import PredictionUtils, { getRandomPrediction } from "@/utils/predictionUtils";
import { resolve } from "path";

export default class PredictionApi {
  private predictionUtils: PredictionUtils;
  private modules: ScriptModules;

  private readonly apiNamespace: string = "oceanity";
  private readonly apiBase: string = "/predictions";

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
    this.predictionUtils = new PredictionUtils(path, modules);
  }

  /**
   * Initializes DbUtils and registers endpoints
   */
  public async setup(): Promise<void> {
    await this.predictionUtils.setup();
    await this.registerEndpoints();
  }

  /**
   * Registers Prediction endpoints to Firebot's HttpServer
   * @returns {boolean} `true` if operation was successful
   */
  private async registerEndpoints(): Promise<boolean> {
    const { httpServer, logger } = this.modules;
    logger.info("Registering Prediction Endpoints....");

    // Prediction Root
    httpServer.registerCustomRoute(
      this.apiNamespace,
      this.apiBase,
      "GET",
      (req: Request, res: Response) => {
        const { slug, broadcaster_id } = getRequestDataFromUri(req.url).params;
        const response = getRandomPrediction(slug, broadcaster_id);

        if (response.status != 200) {
          logger.error(`Error ${response.status}: ${response.message}`);
          return false;
        }

        logger.info(`Pulled prediction ${response.predictionRequest.title}`);
        res.send(response.predictionRequest);
      },
    );

    httpServer.registerCustomRoute(
      this.apiNamespace,
      `${this.apiBase}/create`,
      "POST",
      (req: Request, res: Response) => {
        res.send(true);
      },
    );

    return true;
  }

  /**
   * Unregisters Prediction Endpoints from Firebot's HttpServer
   * @returns {boolean} `true` if operation was successful
   */
  public async unregisterEndpoints(): Promise<boolean> {
    const { httpServer, logger } = this.modules;
    let response = true;

    logger.info("Unregistering Prediction Endpoints...");

    response &&= httpServer.unregisterCustomRoute(
      this.apiNamespace,
      this.apiBase,
      "GET",
    );

    return response;
  }
}
