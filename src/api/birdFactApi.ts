import { Request, Response } from "express";
import birdFacts from "@u/birdFactUtils";
import api from "@u/apiUtils";

export default class BirdFactApi {
  private static readonly route: string = "/birdFacts";

  static registerEndpoints() {
    api.registerAllEndpoints(
      [
        // [`${route}/:id`, "GET", this.getHandler],
        // [`${route}/all`, "GET", this.getAllHandler],
        [`${this.route}`, "GET", this.generateNewFactHandler],
      ],
      "Birb Fact",
    );
  }

  /*private getHandler = async (req: Request, res: Response): Promise<void> => {
    const { id } = getRequestDataFromUri(req.url).params;
    res.send(await this.birdFactUtils.getBirdFact(parseInt(id)));
  }

  private getAllHandler = async (req: Request, res: Response): Promise<void> => {
    res.send(await this.birdFactUtils.getAllBirdFacts());
  }*/

  private static async generateNewFactHandler(req: Request, res: Response) {
    res.send(await birdFacts.generateNewFactAsync());
  }
}
