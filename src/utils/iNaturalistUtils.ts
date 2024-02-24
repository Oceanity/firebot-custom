import { iNaturalistData } from "@t/birdFacts";
import { SearchResult, TaxonPhotoResult } from "@t/iNaturalist";
import { getRandomItem } from "@u/array";

export default class iNaturalistUtils {
  public static readonly apiBase: string = "https://api.inaturalist.org/v1/search?";

  public static getBirdInfo = async (name: string): Promise<iNaturalistData | undefined> => {
    const response = await fetch(this.apiBase + new URLSearchParams({
      q: name,
      sources: "taxa",
      order: "desc"
    }));
    const results: SearchResult[] = (await response.json()).results;
    const bird = results[0].record;

    const photo = bird.taxon_photos && bird.taxon_photos.length
      ? getRandomItem<TaxonPhotoResult>(bird.taxon_photos)?.photo
      : bird.default_photo;

    return {
      id: bird.id.toString(),
      photo_url: photo?.original_url ?? photo?.medium_url,
      photo_attribution: photo?.attribution
    }
  }
}
