import { Logger } from "@crowbartools/firebot-custom-scripts-types/types/modules/logger";
import fs from "fs-extra";
import { resolve } from "path";
import { PlexOauth, IPlexClientDetails } from "plex-oauth";
import open from "open";

type PlexAuthFile = {
  token?: "";
};

const clientInformation: IPlexClientDetails = {
  clientIdentifier: "1a3ce88e-ec86-4da9-9299-7c27f99ed47a",
  product: "Oceanity's Plex Toolkit",
  device: "Firebot",
  version: "1.0.0",
  forwardUrl: "http://localhost:7472/integrations/oceanity-plex-toolkit/plex-auth",
  platform: "Web",
  urlencode: true,
};

const plexAuth: PlexAuthFile = {};
const root = resolve(__dirname + "/oceanity/plex-toolkit/");
const tokenFile = resolve(root + "/token.json");
let log: Logger;

export default class PlexAuth {
  constructor(logger: Logger) {
    log = logger;
  }

  public async login() {
    const plexOauth = new PlexOauth(clientInformation);

    const [hostedUILink, pin] = await plexOauth.requestHostedLoginURL();
    log.info(hostedUILink);

    // plexOauth.requestHostedLoginURL().then((data) => {
    //   let [hostedUILink, pinId] = data;
    //   open(hostedUILink);

    //   //   await new Promise<string>((resolve, reject) => {

    //   //   });

    //   plexOauth
    //     .checkForAuthToken(pinId)
    //     .then((authToken) => {
    //       log.info(authToken); // Returns the auth token if set, otherwise returns null

    //       // An auth token will only be null if the user never signs into the hosted UI, or you stop checking for a new one before they can log in
    //     })
    //     .catch((err) => {
    //       log.error(err);
    //       throw err;
    //     });
    // });
  }

  // Load Saved Plex token from <scripts>/oceanity/plex-toolkit/token.json
  public async loadSavedPlexToken() {
    const fileExists = fs.existsSync(tokenFile);
    await this.savePlexAuth();
    if (!fileExists) {
      await fs.outputFile(tokenFile, JSON.stringify(plexAuth), () => {
        log.info(`Created Plex Token file at "${tokenFile}"`);
      });
    }

    const saved = await fs.readFile(resolve(root + "/token.json"), "utf8", (err, data) => {
      if (err) throw err;

      var obj = JSON.parse(data);
    });
  }
  public async savePlexAuth() {
    log.info("Test");
  }
}
