import { iNaturalistData } from "@t/birdFacts";
import { getRandomItem } from "./array";

/**
 * Utility class for interacting with the iNaturalist API
 */
export default class iNaturalistUtils {
  private static readonly apiBase: string = "https://api.inaturalist.org/v1/search?";

  /**
   * Retrieves information about a bird from the iNaturalist API
   * @param name The name of the bird to search for
   * @returns A promise that resolves to the bird's information, or undefined if no bird was found
   */
  static getBirdInfo = async (
    name: string
  ): Promise<iNaturalistData | undefined> => {
    const response = await fetch(this.apiBase + new URLSearchParams({
      q: name,
      sources: "taxa",
      order: "desc"
    }));
    const data = await response.json();
    const bird = data.results[0].record;

    const photo = bird.taxon_photos && bird.taxon_photos.length
      ? getRandomItem<{ [key: string]: object }>(bird.taxon_photos)?.photo
      : bird.default_photo;

    return {
      id: bird.id,
      photo_url: photo.original_url ?? photo.medium_url,
      photo_attribution: photo.attribution
    }
  }
}

