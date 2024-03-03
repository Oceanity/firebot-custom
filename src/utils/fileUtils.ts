/**
 * A class that provides methods for working with files.
 */
export default class FileUtils {
  /**
   * Creates a Blob from the specified URL.
   * @param url The URL of the file to create a Blob from.
   * @returns A Promise that resolves with the created Blob.
   */
  static createBlobFromUrlAsync = async (url: string): Promise<Blob> =>
    await new Promise((resolve, reject) => {
      fetch(url).then(async (response) => {
        const reader = await response.blob();
        if (!reader) reject("Could not get blob");

        resolve(reader);
      });
    });
}
