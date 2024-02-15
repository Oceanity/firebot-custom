import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { Request, Response } from "express";
import { getRequestDataFromUri } from "@u/requestUtils";
import { getRandomPrediction } from "@u/predictionUtils";
import { JsonDB } from "node-json-db";
import { resolve } from "path";

export default class PredictionApi {
  private db: JsonDB;
  private modules: ScriptModules;

  private readonly apiNamespace: string = "oceanity";
  private readonly apiBase: string = "/predictions";

  constructor(
    path: string = resolve(__dirname, "./predictions.db"),
    modules: ScriptModules,
  ) {
    this.modules = modules;
    // @ts-ignore
    this.db = new modules.JsonDb(path, true, true);
  }

  public async registerEndpoints(): Promise<boolean> {
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
