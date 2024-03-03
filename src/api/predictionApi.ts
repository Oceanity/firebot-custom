import { Request, Response } from "express";
import { getRequestDataFromUri } from "@u/requestUtils";
import predictions from "@u/predictionUtils";
import { CreatePredictionOptionsRequest, CreatePredictionRequest } from "@t/predictions";
import api from "@u/apiUtils";
import store from "@u/store";

export default class PredictionApi {
  private static readonly route = "/predictions";

  static registerEndpoints() {
    api.registerAllEndpoints(
      [
        [`${this.route}/:slug`, "GET", this.getPredictionHandler],
        [`${this.route}/:slug`, "POST", this.startPredictionHandler],
        [`${this.route}/:slug/titles`, "GET", this.getPredictionTitlesHandler],
      ],
      "Prediction",
    );
  }

  private static async getPredictionHandler(req: Request, res: Response) {
    const { broadcaster_id } = getRequestDataFromUri(req.url).params;
    const { slug } = req.params;

    store.modules.logger.info(JSON.stringify(req.body));

    const response = await predictions.getRandomPredictionAsync(req.url);
    if (!response) throw `Could not get random prediction from slug ${slug}`;

    const predictionResponse: CreatePredictionRequest = {
      ...response,
      broadcaster_id,
      prediction_window: 300,
    };

    res.send(predictionResponse);
  }

  private static async startPredictionHandler(req: Request, res: Response) {
    const { slug, titleChoices, outcomeChoices } = req.body as CreatePredictionOptionsRequest;

    res.send(await predictions.addPredictionOptionsAsync(slug, { titleChoices, outcomeChoices }));
  }

  private static async getPredictionTitlesHandler(req: Request, res: Response) {
    const { slug } = getRequestDataFromUri(req.url).params;

    const response = await predictions.getPredictionOptionsAsync(slug);
    if (!response) throw `Could not get prediction titles from slug ${slug}`;

    const { titleChoices } = response;

    res.send(titleChoices);
  }
}
