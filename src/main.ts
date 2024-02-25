import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import useRouter from "@/router";
import PredictionApi from "@api/predictionApi";
import BirdFactApi from "./api/birdFactApi";
import MastodonApi from "./api/mastodonApi";
import { resolve } from "path";
import * as dotenv from "dotenv";
import store from "@u/store";
import BirdFactTopicApi from "./api/birdFactTopicApi";
import BirdFactLoadingMessageApi from "./api/birdFactLoadingMessageApi";
import MastodonBirdFactApi from "./api/mastodonBirdFactApi";

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
    // Config .env vars
    dotenv.config({ path: resolve(__dirname, "./.env") });

    // Set Globals
    store.modules = runRequest.modules;

    // Use Router
    useRouter(store.modules.httpServer);

    // Setup API Endpoints
    await new PredictionApi("./db/predictions.db").setup();
    await new BirdFactApi().setup();
    await new BirdFactTopicApi().setup();
    await new BirdFactLoadingMessageApi().setup();
    await new MastodonApi().setup();
    await new MastodonBirdFactApi().setup();
  },
};

export default script;
