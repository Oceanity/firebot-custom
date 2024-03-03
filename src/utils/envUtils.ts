/**
 * Class for interacting with environment variables.
 */
export default class Env {
  /**
   * Get an environment variable or throw an error if it does not exist.
   * @param key The name of the environment variable to get.
   * @returns The value of the environment variable.
   * @throws If the environment variable does not exist.
   */
  static getEnvVarOrThrow(key: string): string {
    const value = process.env[key];
    if (!value) throw `Could not get "${key}" from process.env`;
    return value;
  }
}
