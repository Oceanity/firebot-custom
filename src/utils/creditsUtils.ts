import db from "@u/dbUtils";

export default class CreditUtils {
  private static readonly path = "./db/credits";
  private static readonly route = "/credits";
  private static readonly tiers: SubTier[] = ["3000", "2000", "1000"];

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
  static async resetCreditsAsync(): Promise<boolean> {
    const resetSubs = (await this.getDaysSinceSubsLastCheckedAsync()) > 1;
    const currentSubs = resetSubs
      ? new EmptySubsEntryCollection()
      : await db.getAsync<SubsEntryCollection>(this.path, `${this.route}/currentSubs`, new EmptySubsEntryCollection());

    db.push<Credits>(this.path, this.route, new EmptyCredits(), true);
    db.push<SubsEntryCollection>(
      this.path,
      `${this.route}/currentSubs`,
      currentSubs ?? new EmptySubsEntryCollection(),
      true,
    );

    return resetSubs;
  }

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

  static async buildCreditsPageAsync(): Promise<string> {
    let response = `<!DOCTYPE html><html><body style="opacity: 0"><div class="marquee-container"><div class="marquee"><h1>Thanks so much to:</h1>`;
    const close = `<h2>And you just for being here!</h2></div></div></body></html>`;

    const credits = await this.getCredtisAsync();
    if (!credits) return response + close;

    response += this.buildFollowersSection(credits.followers, "New Followers");

    const newSubs = await db.getAsync<SubsEntryCollection>(
      this.path,
      `${this.route}/newSubs`,
      new EmptySubsEntryCollection(),
    );

    if (newSubs && Object.values(newSubs).some((arr) => arr.length > 0)) {
      response += this.getTitle("New Subscribers");
      for (const tier of this.tiers) {
        response += this.buildSubsSection(newSubs[tier], `subs-tier-${tier}`);
      }
    }

    const currentSubs = await db.getAsync<SubsEntryCollection>(
      this.path,
      `${this.route}/currentSubs`,
      new EmptySubsEntryCollection(),
    );

    if (currentSubs && Object.values(currentSubs).some((arr) => arr.length > 0)) {
      response += this.getTitle("Current Subscribers");
      for (const tier of this.tiers) {
        response += this.buildSubsSection(currentSubs[tier], `subs-tier-${tier}`);
      }
    }

    // response += this.buildGiftsSection(credits.giftSubs, "Gift Subs");
    response += this.buildModsSection(credits.moderators, "Moderators");
    response += close;
    return response;
  }

  private static buildCreditsSection<T>(
    className?: string | null,
    title?: string | null,
    content?: T[],
    addOnCallback: ItemCallback<T> = () => "",
    showAvatars = true,
  ) {
    if (!content || !content.length) return "";
    let response = `<section${className ? ` class="${className}"` : ""}>${this.getTitle(title)}<ul>`;
    for (const entry of content) {
      const creditEntry = entry as CreditEntry;

      response += `<li data-id="${creditEntry.id}">${showAvatars ? `<img src="${creditEntry.profileImageUrl}">` : ""}<p><span class="name">${creditEntry.displayName}</span><span class="add-on">${addOnCallback(entry)}</span></p></li>`;
    }
    response += `</ul></section>`;
    return response;
  }

  private static buildFollowersSection = (followers?: FollowerEntry[], title = "Followers") =>
    this.buildCreditsSection("followers", title, followers);

  private static buildModsSection = (moderators?: ModeratorEntry[], title = "Moderators") =>
    this.buildCreditsSection("moderators", title, moderators);

  //#region Subs
  private static buildSubsSection = (subscribers?: SubscriberEntry[], className = "subscribers") =>
    subscribers
      ? this.buildCreditsSection(className, null, subscribers, (sub: SubscriberEntry) =>
          this.getDisplayTier(sub.tier as SubTier),
        )
      : "";

  private static buildGiftSubsSection = (giftSubs?: GiftSubEntry[], className = "gift-subs") =>
    giftSubs
      ? this.buildCreditsSection(className, "Gift Subs", giftSubs, (giftSub: GiftSubEntry) => {
          const tierEntries = Object.entries(giftSub.giftsPerTier).map(
            ([tier, count]) => `${this.getDisplayTier(tier as SubTier)}: x${count}`,
          );
          return tierEntries.join(", ");
        })
      : "";

  private static getDisplayTier = (tier: SubTier) => `Tier ${tier.substring(0, 1)}`;
  //#endregion

  private static getTitle = (title?: string | null, level = 2) => (title ? `<h${level}>${title}</h${level}>` : "");
}

type Credits = {
  followers: FollowerEntry[];
  moderators: ModeratorEntry[];
  currentSubs: SubsEntryCollection;
  currentGiftSubs: GiftSubEntry[];
  newSubs: SubsEntryCollection;
  newGiftSubs: GiftSubEntry[];
};

class EmptyCredits implements Credits {
  followers = [];
  moderators = [];
  currentSubs = new EmptySubsEntryCollection();
  currentGiftSubs = [];
  newSubs = new EmptySubsEntryCollection();
  newGiftSubs = [];
}

type CreditEntry = {
  id: string;
  displayName: string;
  profileImageUrl: string;
};

type ItemCallback<T> = (item: T) => string;

type FollowerEntry = CreditEntry;

type ModeratorEntry = CreditEntry;

type SubscriberEntry = CreditEntry & {
  tier: string;
};

type SubTier = "1000" | "2000" | "3000";

type SubsEntryCollection = { [key in SubTier]: SubscriberEntry[] };

class EmptySubsEntryCollection implements SubsEntryCollection {
  "1000" = [];
  "2000" = [];
  "3000" = [];
}

type GiftSubEntry = CreditEntry & {
  giftsPerTier: { [key in SubTier]: number };
};
