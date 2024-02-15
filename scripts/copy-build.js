/**
 *  Copies the built script .js to Firebot's scripts folder
 */
const fs = require("fs-extra");
const path = require("path");
const { scriptOutputName } = require("../package.json");

const getAppDataFolderPath = () => {
  switch (process.platform) {
    case "win32":
      return process.env.APPDATA;
    case "darwin":
      return path.join(
        process.env.HOME,
        "/Library/Application Support"
      );
    case "linux":
      return path.join(
        process.env.HOME,
        "/.config"
      );
    default:
      return null;
  }
}

const getFirebotScriptsFolderPath = () => {
  // determine os app data folder
  const appDataFolderPath = getAppDataFolderPath();
  if (!appDataFolderPath) throw new Error("Unsupported OS!");

  const firebotDataFolderPath = path.join(appDataFolderPath, "/Firebot/v5/");
  const firebotGlobalSettings = require(path.join(
    firebotDataFolderPath,
    "global-settings.json"
  ));

  if (
    firebotGlobalSettings == null ||
    firebotGlobalSettings.profiles == null ||
    firebotGlobalSettings.profiles.loggedInProfile == null
  ) {
    throw new Error("Unable to determine active profile");
  }

  const activeProfile = firebotGlobalSettings.profiles.loggedInProfile;

  const scriptsFolderPath = path.join(
    firebotDataFolderPath,
    `/profiles/${activeProfile}/scripts/`
  );
  return scriptsFolderPath;
};

const main = async () => {
  const firebotScriptsFolderPath = getFirebotScriptsFolderPath();
  const scriptFileName = `${scriptOutputName}.js`
  const outputDir = `${firebotScriptsFolderPath}/${scriptOutputName}/`;

  const srcScriptFilePath = path.resolve(`./dist/${scriptFileName}`);
  const destScriptFilePath = path.join(
    outputDir,
    "index.js"
  );

  await fs.ensureDir(outputDir);
  await fs.copyFile(srcScriptFilePath, destScriptFilePath);

  console.log(`Successfully copied ${scriptFileName} to Firebot scripts folder.`);
};

main();
