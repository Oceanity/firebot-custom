import {
  Prediction,
  PredictionLibrary,
  PredictionResponse,
} from "@t/predictions";
import { getRandomString } from "@u/array";

export const predictions: PredictionLibrary = {
  swampSpiderHouse: {
    titleChoices: [
      "Squamp? (Items in SSH)",
      "Squamp??? (Items in SSH)",
      "Romp in the Squamp (Items in SSH)",
    ],
    outcomeChoices: [
      ["SQUAMP (2+)", "Totem PROVIDES (2+)", "MAX SQUAMP (2+)"],
      ["squamp (1)", "Lil' Squampy (1)"],
      ["Squampn't (0)", "Swamp Spider House (0)"],
    ],
  },
  oceanSpiderHouse: {
    titleChoices: ["Oshi's House (Items in OSH)"],
    outcomeChoices: [
      ["Oshi Cute (2+)"],
      ["Cute birb (1)"],
      ["Nobody's Home (0)"],
    ],
  },
  graveyard: {
    titleChoices: ["Party at the Graveyard (Items in Graveyard)"],
    outcomeChoices: [["Monster Mash (1+)"], ["Graveyard Smash (0)"]],
  },
  circlinBird: {
    titleChoices: ["Circlin' Bird (Items in Termina Bird)"],
    outcomeChoices: [
      ["Circle (1+)", "🔵 (1+)"],
      ["Square (0)", "🟦 (0)"],
    ],
  },
};

export const getRandomPrediction = (
  slug: string,
  broadcaster_id: string,
): PredictionResponse => {
  if (!isValidPredictionSlug) {
    return {
      status: 409,
      message: slug
        ? `No prediction with slug ${slug}`
        : `Required param \`slug\` missing`,
    };
  }
  const { titleChoices, outcomeChoices } = predictions[slug];
  const prediction: Prediction = {
    broadcaster_id,
    title: getRandomString(titleChoices),
    outcomes: [],
    prediction_window: 300,
  };

  for (let o of outcomeChoices) {
    prediction.outcomes.push({
      title: getRandomString(o),
    });
  }

  return {
    status: 200,
    prediction,
  };
};

export const isValidPredictionSlug = (slug: string): boolean =>
  slug && predictions.hasOwnProperty(slug);
