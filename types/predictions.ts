import { ResponseData } from "@t/requests";

export type Prediction = {
  title: string;
  outcomes: PredictionOutcome[];
};

export class PredictionClass implements Prediction {
  title = "";
  outcomes: PredictionOutcome[] = [];
}

export type PredictionOutcome = {
  title: string;
};

type PredictionWindow = 30 | 60 | 120 | 300 | 600 | 900 | 1200 | 1800;

export type PredictionLibrary = {
  [key: string]: PredictionOptions;
};

export type PredictionOptions = {
  titleChoices: string[];
  outcomeChoices: string[][];
};

export type CreatePredictionResponse = ResponseData & {
  predictionRequest?: CreatePredictionRequest;
};

export type CreatePredictionRequest = Prediction & {
  broadcaster_id: string;
  prediction_window: PredictionWindow;
};

export type CreatePredictionLibraryEntryRequest = {
  slug: string;
  titleChoices?: string[];
  outcomeChoices?: string[][];
};
