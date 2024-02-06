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
      stringOfLength("Squamp? (Items in SSH)", 1, 45),
      stringOfLength("Squamp??? (Items in SSH)", 1, 45),
      stringOfLength("Romp in the Squamp (Items in SSH)", 1, 45),
    ],
    outcomeChoices: [
      [
        stringOfLength("Squampn't (0)", 1, 25),
        stringOfLength("Swamp Spider House (0)", 1, 25),
        stringOfLength("asdlkfjasdlfkjasdlkfjasdkljfasdkljf", 1, 25),
      ],
      [
        stringOfLength("squamp (1)", 1, 25),
        stringOfLength("Lil' Squampy (1)", 1, 25),
      ],
      [
        stringOfLength("SQUAMP (2+)", 1, 25),
        stringOfLength("Totem PROVIDES (2+)", 1, 25),
        stringOfLength("MAX SQUAMP (2+)", 1, 25),
      ],
    ],
  },
  oceanSpiderHouse: {
    titleChoices: [stringOfLength("Oshi's House", 1, 45)],
    outcomeChoices: [
      [stringOfLength("Nobody's Home (0 Items)", 1, 25)],
      [stringOfLength("Cute birb (1 Item)", 1, 25)],
      [stringOfLength("Oshi Cute (2+ Items)", 1, 25)],
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
  const { titleChoices, outcomeChoices } = predictions[slug];
  const prediction: Prediction = {
    title: stringOfLength(getRandomString(titleChoices), 1, 45),
    outcomes: [],
    prediction_window: 300,
  };

  for (let o of outcomeChoices) {
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
