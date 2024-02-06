import { ResponseData } from "@t/requests";

export type Prediction = {
  broadcaster_id: string;
  title: string;
  outcomes: PredictionOutcome[];
  prediction_window: PredictionWindow;
};

type PredictionOutcome = {
  title: string;
};

type PredictionWindow = 30 | 60 | 120 | 300 | 600 | 900 | 1200 | 1800;

export type PredictionLibrary = {
  [key: string]: PredictionOptions;
};

export type PredictionOptions = {
  titleChoices: string[];
  optionChoices: string[][];
};

export type PredictionResponse = ResponseData & {
  prediction?: Prediction;
};
