import { MastodonContext, RemoteAttachment } from "@t/mastodon";
import FileUtils from "./fileUtils";
import DbUtils from "./dbUtils";
import env from "@u/envUtils";
import store from "@u/store";

export default class MastodonUtils {
  private readonly db: DbUtils;

  constructor(context: MastodonContext) {
    if (!context.accessToken) throw "Could not read MASTODON_ACCESS_TOKEN";

    this.db = new DbUtils("./db/mastodon");
  }

  private getNextBirdFactId = async (): Promise<number> =>
    await this.db.get<number>("/birdFacts/nextId", 1) ?? 1;

  private incrementNextBirdFactId = async (): Promise<boolean> =>
    await this.db.set<number>("/birdFacts/nextId", await this.getNextBirdFactId() + 1);

  static postNewMessage = async (context: MastodonContext, status: string, attachments?: RemoteAttachment[]): Promise<boolean> => {
    const headers = MastodonUtils.getHeaders(context);
    const attachmentIds: string[] = [];

    if (attachments && attachments.length) {
      for(const attach of attachments) {
        const formData = new FormData();

        formData.append("file", await FileUtils.createBlobFromUrl(attach.url));
        formData.append("description", attach.description);

        const uploadResp = await fetch(`${context.apiBase}/v2/media`, {
          method: "POST",
          headers,
          body: formData
        });

        if (!uploadResp) continue;

        const data = await uploadResp.json();
        attachmentIds.push(data.id);
      }
    }

    const body = JSON.stringify({
        status: status,
        sensitive: false,
        media_ids: attachmentIds,
        visibility: "unlisted"
      });

    const response = await fetch(`${context.apiBase}/v1/statuses`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json"
      },
      body
    });
    const data = await response.json();

    if (data.error) {
      store.modules.logger.error(data.error);
      return false;
    }

    return true;
  }

  private static getHeaders = (context: MastodonContext): HeadersInit =>
    ({
      "Authorization": `Bearer ${MastodonUtils.getAccessTokenOrThrow(context)}`
    });

  private static getAccessTokenOrThrow = (context: MastodonContext): string => {
    if (context.accessToken) return context.accessToken;
    if (context.accessTokenEnvVar) return env.getEnvVarOrThrow(context.accessTokenEnvVar);
    throw `Could not get access token from process.env for ${context.apiBase}`;
  }
}
