export default class Env {
  /**
   * Gets variable from process.env or throws exception
   * @param {string} key Key to pull from process.env
   * @returns {string} Value of provided key
   */
  static getEnvVarOrThrow = (key: string): string => {
    const value = process.env[key];
    if (!value) throw `Could not get "${key}" from process.env`;
    return value;
  }
}
