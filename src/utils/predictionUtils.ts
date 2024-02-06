import {
  Prediction,
  PredictionLibrary,
  PredictionResponse,
} from "@t/predictions";
import { getRandomString } from "@u/array";
import { stringOfLength } from "@t/strings";

export const predictions: PredictionLibrary = {
  swampSpiderHouse: {
    titleChoices: [
      "Squamp? (Items in SSH)",
      "Squamp??? (Items in SSH)",
      "Romp in the Squamp (Items in SSH)",
    ],
    optionChoices: [
      [
        "Squampn't (0)",
        "Swamp Spider House (0)",
        "asdlkfjasdlfkjasdlkfjasdkljfasdkljf",
      ],
      ["squamp (1)", "Lil' Squampy (1)"],
      ["SQUAMP (2+)", "Totem PROVIDES (2+)", "MAX SQUAMP (2+)"],
    ],
  },
  oceanSpiderHouse: {
    titleChoices: ["Oshi's House"],
    optionChoices: [
      ["Nobody's Home (0 Items)"],
      ["Cute birb (1 Item)"],
      ["Oshi Cute (2+ Items)"],
    ],
  },
};

export const getRandomPrediction = (slug: string): PredictionResponse => {
  if (!isValidPredictionSlug) {
    return {
      status: 409,
      message: slug
        ? `No prediction with slug ${slug}`
        : `Required param \`slug\` missing`,
    };
  }
  const { titleChoices, optionChoices } = predictions[slug];
  const prediction: Prediction = {
    title: stringOfLength(getRandomString(titleChoices), 1, 45),
    outcomes: [],
    prediction_window: 300,
  };

  for (let o of optionChoices) {
    prediction.outcomes.push({
      title: stringOfLength(getRandomString(o), 1, 25),
    });
  }

  return {
    status: 200,
    prediction,
  };
};

export const isValidPredictionSlug = (slug: string): boolean =>
  slug && predictions.hasOwnProperty(slug);
