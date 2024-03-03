import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import useRouter from "@/router";
import { resolve } from "path";
import * as dotenv from "dotenv";
import store from "@u/store";
import registerAllEndpoints from "@/api";
import nuthatch from "@u/nuthatchUtils";

type Params = {
  message: string;
};

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
    registerAllEndpoints();

    // Check cached Nuthatch birds
    await nuthatch.updateCachedDataAsync();
  },
};

export default script;
