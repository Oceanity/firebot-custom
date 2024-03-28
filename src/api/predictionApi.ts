import { Request, Response } from "express";
import predictions from "@u/predictionUtils";
import { CreatePredictionOptionsRequest, CreatePredictionRequest } from "@t/predictions";
import api from "@u/apiUtils";

export default class PredictionApi {
  private static readonly route = "/predictions";

  static registerEndpoints() {
    api.registerAllEndpoints(
      [
        [`${this.route}`, "GET", this.getPredictionHandler],
        [`${this.route}`, "POST", this.startPredictionHandler],
        [`${this.route}/titles`, "GET", this.getPredictionTitlesHandler],
      ],
      "Prediction",
    );
  }

  private static async getPredictionHandler(req: Request, res: Response) {
    const { slug, broadcaster_id } = api.getRequestDataFromUri(req.url).params;

    if (!slug || !broadcaster_id) {
      res.status(400);
      res.send("Missing slug or broadcaster_id in request body");
      return;
    }

    const response = await predictions.getRandomPredictionAsync(slug);
    if (!response) {
      res.status(404);
      res.send(`Could not get random prediction from slug ${slug}`);
      return;
    }

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
    const { slug } = api.getRequestDataFromUri(req.url).params;

    const response = await predictions.getPredictionOptionsAsync(slug);
    if (!response) throw `Could not get prediction titles from slug ${slug}`;

    const { titleChoices } = response;

    res.send(titleChoices);
  }
}
