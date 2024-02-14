import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import useRouter from "@/router";
import registerPredictionEndpoints from "@api/predictionApi";

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
  run: (runRequest) => {
    const { logger, httpServer, JsonDb } = runRequest.modules;
    logger.info(runRequest.parameters.message);
    useRouter(httpServer);
    registerPredictionEndpoints(logger, httpServer);
  },
};

export default script;
