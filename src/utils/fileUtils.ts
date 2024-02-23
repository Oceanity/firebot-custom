export default class FileUtils {
  static createBlobFromUrl = async (url: string): Promise<Blob> => {
    return await new Promise((resolve, reject) => {
      fetch(url).then(async response => {
        const reader = await response.blob();
        if (!reader) reject("Could not get blob");

        resolve(reader);
      });
    });
  }
}
