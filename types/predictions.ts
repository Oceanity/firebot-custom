import { ResponseData } from "@t/requests";
import { StringOfLength } from "@t/strings";

export type Prediction = {
  title: StringOfLength<1, 45>;
  outcomes: PredictionOutcome[];
  prediction_window: PredictionWindow;
};

type PredictionOutcome = {
  title: StringOfLength<1, 25>;
};

type PredictionWindow = 30 | 60 | 120 | 300 | 600 | 900 | 1200 | 1800;

export type PredictionLibrary = {
  [key: string]: PredictionOptions;
};

export type PredictionOptions = {
  titleChoices: StringOfLength<1, 45>[];
  outcomeChoices: StringOfLength<1, 25>[][];
};

export type PredictionResponse = ResponseData & {
  prediction?: Prediction;
};
