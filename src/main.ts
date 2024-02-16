import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import useRouter from "@/router";
import PredictionApi from "@api/predictionApi";

interface Params {
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
    const { modules } = runRequest;
    const { httpServer } = modules;
    useRouter(httpServer);

    // Predictions
    const predictionApi = new PredictionApi("./db/predictions.db", modules);
    await predictionApi.setup();
  },
};

export default script;
