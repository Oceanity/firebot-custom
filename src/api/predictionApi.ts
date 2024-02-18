import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { Request, Response } from "express";
import { getRequestDataFromUri } from "@u/requestUtils";
import PredictionUtils from "@u/predictionUtils";
import { CreatePredictionOptionsRequest } from "@t/predictions";
import { resolve } from "path";

export default class PredictionApi {
  private predictions: PredictionUtils;
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
    const { httpServer, logger } = this.modules;
    logger.info("Registering Prediction Endpoints....");

    // Prediction Root
    httpServer.registerCustomRoute(
      this.apiNamespace,
      this.apiBase,
      "GET",
      async (req: Request, res: Response) => {
        const { slug, broadcaster_id } = getRequestDataFromUri(req.url).params;
        logger.info("Getting random Prediction...");
        const response = await this.predictions.getRandomPrediction(slug);

        if (response.status != 200) {
          logger.error(`Error ${response.status}: ${response.message}`);
          return false;
        }

        logger.info(`Pulled prediction ${response.prediction.title}`);
        res.send({ broadcaster_id, ...response.prediction });
      },
    );

    httpServer.registerCustomRoute(
      this.apiNamespace,
      this.apiBase,
      "POST",
      async (req: Request, res: Response) => {
        const { slug, titleChoices, outcomeChoices } = req.body as CreatePredictionOptionsRequest;

        this.predictions.pushPredictionOptions(slug, { titleChoices, outcomeChoices });

        res.send(true);
      },
    );

    httpServer.registerCustomRoute(
      this.apiNamespace,
      `${this.apiBase}/titles`,
      "GET",
      async (req: Request, res: Response) => {
        const { slug } = getRequestDataFromUri(req.url).params;

        res.send((await this.predictions.getPredictionOptions(slug))?.options.titleChoices ?? []);
      }
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
