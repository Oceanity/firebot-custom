import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { iNaturalistData } from "@t/birdFacts";

export default class iNaturalistUtils {
  public static readonly apiBase: string = "https://api.inaturalist.org/v1/taxa";

  public static getBirdInfo = async (sciName: string, modules?: ScriptModules): Promise<iNaturalistData | undefined> => {
    const response = await fetch("https://api.inaturalist.org/v1/taxa?" + new URLSearchParams({
      q: sciName,
      rank: "species",
      order: "desc"
    }));
    const data = await response.json();
    const bird = data.results.pop();

    if (modules) modules.logger.info(JSON.stringify(bird));

    return {
      id: bird.id,
      photo_url: bird.default_photo.medium_url,
      photo_attribution: bird.default_photo.attribution
    }
  }
}
