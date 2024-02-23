import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import useRouter from "@/router";
import PredictionApi from "@api/predictionApi";
import BirdFactApi from "./api/birdFactApi";
import MastodonApi from "./api/mastodonApi";
import Globals from "./utils/global";

type Params = {
  message: string;
}

const script: Firebot.CustomScript<Params> = {
  getScriptManifest: () => ({
    name: "Oshi's Custom Firebot Startup",
    description: "Extends Firebot functionality",
    author: "Oceanity",
    version: "1.0",
    firebotVersion: "5",
  }),
  getDefaultParameters: () => ({
    message: {
      type: "string",
      default: "Hello World!",
      description: "Message",
      secondaryDescription: "Enter a message here",
    },
    test: {
      type: "button",
    },
  }),
  run: async (runRequest) => {
    const { httpServer } = runRequest.modules;
    useRouter(httpServer);

    // Set Globals
    Globals.modules = runRequest.modules;

    Globals.modules.logger.info("Global properties set");

    // Predictions
    const predictionApi = new PredictionApi("./db/predictions.db");
    await predictionApi.setup();

    // Bird Facts
    const birdFactApi = new BirdFactApi();
    await birdFactApi.setup();

    // Mastodon
    const mastodonApi = new MastodonApi();
    await mastodonApi.setup();
  },
};

export default script;
