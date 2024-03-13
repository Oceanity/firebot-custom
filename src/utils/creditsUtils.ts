import db from "@u/dbUtils";

export default class CreditUtils {
  private static readonly path = "./db/credits";
  private static readonly route = "/credits";

  //#region Caching
  static getSubsLastCheckedDateAsync = async (): Promise<string> =>
    (await db.getAsync<string>(this.path, `${this.route}/subsLastChecked`, new Date().toISOString())) ??
    new Date().toISOString();

  static setSubsLastCheckedDateAsync = async (): Promise<boolean> =>
    await db.push<string>(this.path, `${this.route}/subsLastChecked`, new Date().toISOString(), true);

  static getDaysSinceSubsLastCheckedAsync = async (): Promise<number> =>
    Math.floor(
      (new Date().getTime() - new Date(await this.getSubsLastCheckedDateAsync()).getTime()) / (1000 * 60 * 60 * 24) ??
        0,
    );
  //#endregion

  //#region Credits API services
  static resetCreditsAsync = async () => db.push<Credits>(this.path, this.route, new EmptyCredits(), true);

  static getCredtisAsync = async (): Promise<Credits> =>
    (await db.getAsync<Credits>(this.path, this.route, new EmptyCredits())) ?? new EmptyCredits();

  static addModeratorAsync = async (entry: ModeratorEntry) =>
    await db.push<ModeratorEntry[]>(this.path, `${this.route}/moderators`, [entry], false);

  static addFollowerAsync = async (entry: FollowerEntry) =>
    await db.push<FollowerEntry[]>(this.path, `${this.route}/followers`, [entry], false);

  static resetCurrentSubscribersAsync = async () =>
    await db.push<SubsEntryCollection>(this.path, `${this.route}/currentSubs`, new EmptySubsEntryCollection(), true);

  static addCurrentSubscriberAsync = async (entry: SubscriberEntry) =>
    await db.push<SubscriberEntry[]>(this.path, `${this.route}/currentSubs/${entry.tier}`, [entry], false);

  static addNewSubscriberAsync = async (entry: SubscriberEntry) =>
    await db.push<SubscriberEntry[]>(this.path, `${this.route}/newSubs/${entry.tier}`, [entry], false);

  static addGiftSubAsync = async (entry: GiftSubEntry) =>
    await db.push<GiftSubEntry[]>(this.path, `${this.route}/giftSubs`, [entry], false);
  ////#endregion

  static async buildCreditsPageAsync(title: string = "Credits"): Promise<string> {
    let response = `<!DOCTYPE html><html><body><h1>${title}</h1>`;
    const close = `</body></html>`;

    const credits = await this.getCredtisAsync();
    if (!credits) return response + close;

    response += this.buildFollowersSection(credits.followers, "New Followers", true);

    const currentSubs = await db.getAsync<SubsEntryCollection>(
      this.path,
      `${this.route}/currentSubs`,
      new EmptySubsEntryCollection(),
    );
    if (currentSubs && (currentSubs["3000"].length || currentSubs["2000"].length || currentSubs["1000"].length)) {
      response += "<h1>Current Subscribers</h1>";
      response += this.buildSubsSection(currentSubs["3000"], "current-tier3", "Tier 3", true);
      response += this.buildSubsSection(currentSubs["2000"], "current-tier2", "Tier 2", true);
      response += this.buildSubsSection(currentSubs["1000"], "current-tier1", "Tier 1", true);
    }

    // response += this.buildGiftsSection(credits.giftSubs, "Gift Subs");
    response += this.buildModsSection(credits.moderators, "Moderators", true);
    response += close;
    return response;
  }

  private static buildCreditsSection(
    className: string,
    title: string,
    content?: CreditEntry[],
    addOn?: string,
    showAvatars = false,
  ) {
    if (!content || !content.length) return "";
    let response = `<section class="${className}"><h2>${title}</h2><ul>`;
    for (const entry of content) {
      response += `<li data-id="${entry.id}">${showAvatars ? `<img src="${entry.profileImageUrl}">` : ""} ${entry.displayName}${addOn ? `<br />${addOn}` : ""}</li>`;
    }
    response += `</ul></section>`;
    return response;
  }

  private static buildFollowersSection = (followers?: FollowerEntry[], title = "Followers", showAvatars = false) =>
    this.buildCreditsSection("followers", title, followers, undefined, showAvatars);

  private static buildModsSection = (moderators?: ModeratorEntry[], title = "Moderators", showAvatars = false) =>
    this.buildCreditsSection("moderators", title, moderators, "Moderated at", showAvatars);

  private static buildSubsSection = (
    subscribers?: SubscriberEntry[],
    className = "subscribers",
    title = "Subscribers",
    showAvatars = false,
  ) => (subscribers ? this.buildCreditsSection(className, title, subscribers, "Subscribed at", showAvatars) : "");
}
class EmptyCredits implements Credits {
  followers = [];
  moderators = [];
  currentSubs = new EmptySubsEntryCollection();
  newSubs = new EmptySubsEntryCollection();
  giftSubs = [];
}

type Credits = {
  followers: FollowerEntry[];
  moderators: ModeratorEntry[];
  currentSubs: SubsEntryCollection;
  newSubs: SubsEntryCollection;
  giftSubs: GiftSubEntry[];
};

type CreditEntry = {
  id: string;
  displayName: string;
  profileImageUrl: string;
};

type FollowerEntry = CreditEntry;

type ModeratorEntry = CreditEntry;

type SubscriberEntry = CreditEntry & {
  tier: string;
};

type SubsEntryCollection = {
  "1000": SubscriberEntry[];
  "2000": SubscriberEntry[];
  "3000": SubscriberEntry[];
};

class EmptySubsEntryCollection implements SubsEntryCollection {
  "1000": SubscriberEntry[] = [];
  "2000": SubscriberEntry[] = [];
  "3000": SubscriberEntry[] = [];
}

type GiftSubEntry = CreditEntry & {
  giftedTo: CreditEntry;
};
