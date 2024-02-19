import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { getRandomInteger } from "@u/numbers"
import * as dotenv from "dotenv";
dotenv.config({ path: `${__dirname}/.env` });

export default class NuthatchUtils {
  private readonly apiBase = "https://nuthatch.lastelm.software/v2";
  private readonly modules: ScriptModules;
  private readonly headers: Headers;
  private readonly birdsPerPage: number = 100;

  private pages: number = 1;

  constructor(modules: ScriptModules) {
    this.modules = modules;
    this.headers = new Headers();
    this.headers.set("Content-Type", "application/json");
    this.headers.set("API-Key", process.env.NUTHATCH_API_KEY ?? "");
  }

  public setup = async () : Promise<void> => {
    const { apiBase, birdsPerPage, headers, modules } = this;
    let hasFoundEnd: boolean = false;

    if (!this.isApiKeySet()) {
      modules.logger.error("Could not load Nuthatch API Key");
      return;
    }

    while (!hasFoundEnd) {
      const response = await fetch(`${apiBase}/birds?page=${this.pages}&pageSize=${birdsPerPage}`, { headers });
      const data = await response.json();

      if (data.entities && data.entities.length) {
        this.pages++;
      }
      else {
        hasFoundEnd = true;
      }
    }

    modules.logger.info(`Bird pages: ${this.pages}`);
  }

  public getRandomBird = async() => {
    const { apiBase, headers, modules } = this;

    if (!this.isApiKeySet()) {
      modules.logger.error("Could not load Nuthatch API Key");
      return;
    }

    const response = await fetch(`${apiBase}/birds?page=${getRandomInteger(this.pages)}&pageSize=${this.birdsPerPage}`, { headers });
    const data = await response.json();

    return data.entities[getRandomInteger(data.entities.length)];
  }

  private isApiKeySet = (): boolean =>
    process.env.NUTHATCH_API_KEY != undefined;
}