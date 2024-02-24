import { MastodonContext, RemoteAttachment } from "@t/mastodon";
import FileUtils from "./fileUtils";
import store from "@u/global";
import { BirdFact } from "@t/birdFacts";

export default class MastodonUtils {
  private readonly headers: HeadersInit;
  private readonly apiBase: string;
  private readonly birdFact: BirdFactUtils;

  constructor(context: MastodonContext) {
    if (!context.accessToken) throw "Could not read MASTODON_ACCESS_TOKEN";

    this.apiBase = context.apiBase;
    this.headers = {
      "Authorization": `Bearer ${context.accessToken}`
    }
  }

  postNewMessage = async(status: string, attachments?: RemoteAttachment[]): Promise<boolean> => {
    const { apiBase, headers } = this;

    const attachmentIds: string[] = [];

    if (attachments && attachments.length) {
      for(const attach of attachments) {
        if (!attach.url) continue;
        const formData = new FormData();

        formData.append("file", await FileUtils.createBlobFromUrl(attach.url));
        formData.append("description", attach.description ?? "");

        const uploadResp = await fetch(`${apiBase}/v2/media`, {
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

    const response = await fetch(`${apiBase}/v1/statuses`, {
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

  postBirbFact = async (): Promise<void> => {
    const fact = await this.birdFact.putBirdFact();
    const attachments = [];
    if (fact.iNatData) {
      attachments.push({
        url: fact.iNatData.photo_url,
        description: `Photo of a ${fact.bird.name}`
      });
    }

    const status = this.mastodon.formatBirbFactStatus(fact);
    const response = await this.mastodon.postNewMessage(status, attachments);

    res.send(response);
  }

  formatBirbFactStatus = (fact: BirdFact): string =>
    [
      `🐦 Birb Fact #${fact.id}`,
      "────────────────────────────",
      [
        `${fact.bird.name} (${fact.bird.sciName})`,
        `${fact.message}`,
        `${fact.iNatData ? `📸 ${fact.iNatData.photo_attribution}` : ""}`
      ].join("\n\n")
    ].join("\n").trim();

}
