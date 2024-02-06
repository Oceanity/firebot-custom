import { HttpServerManager } from "@crowbartools/firebot-custom-scripts-types/types/modules/http-server-manager";
import { Logger } from "@crowbartools/firebot-custom-scripts-types/types/modules/logger";
import { Request, Response } from "express";
import { getRequestDataFromUri } from "@u/requestUtils";
import { getRandomPrediction } from "@u/predictionUtils";

export default async function registerPredictionEndpoints(
  log: Logger,
  httpServer: HttpServerManager,
) {
  log.info("Registering endpoint for random prediction options");

  // Prediction Root
  httpServer.registerCustomRoute(
    "oceanity",
    "/predictions",
    "GET",
    (req: Request, res: Response) => {
      const { slug, broadcaster_id } = getRequestDataFromUri(req.url).params;
      const response = getRandomPrediction(slug, broadcaster_id);

      if (response.status != 200) {
        log.error(`Error ${response.status}: ${response.message}`);
        return;
      }

      log.info(`Pulled prediction ${response.prediction.title}`);
      res.send(response.prediction);
    },
  );
}
