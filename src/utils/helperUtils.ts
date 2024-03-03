import axios from "axios";

/**
 * Utility class for helper functions.
 */
export default class HelperUtils {
  /**
   * Check if a given URL is an image URL.
   * @param url The URL to check.
   * @returns A boolean indicating whether the URL is an image URL.
   * @throws If the URL could not be fetched.
   */
  static async isLinkImage(url: string): Promise<boolean> {
    const response = await axios.get(url, {
      headers: {
        "Accept": "*/*"
      },
      responseType: "stream"
    });

    if (!response) throw `Could not fetch URL: ${url}`;

    const contentType = response.headers["content-type"];
    return contentType?.startsWith("image/") ?? false;
  }

  /**
   * Check if a given date is older than a specified number of days.
   * @param date The date to check.
   * @param days The number of days.
   * @returns A boolean indicating whether the date is older than the specified number of days.
   */
  static isDateOlderThanDays = (date: Date, days: number) =>
    (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24) > days;
}


