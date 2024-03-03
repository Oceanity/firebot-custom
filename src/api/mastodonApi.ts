import { MastodonContext } from "@t/mastodon";
import env from "@u/envUtils";

export default class MastodonApi {
  private static readonly path: string = "/mastodon";
  private static readonly context: MastodonContext = {
    apiBase: "https://botsin.space/api",
    accessToken: env.getEnvVarOrThrow("BOTSINSPACE_ACCESS_TOKEN"),
  };

  static registerEndpoints() {
    // api.registerAllEndpoints([
    // ], "Mastodon");
  }
}
