import BirdFactApi from "@api/birdFactApi";
import BirdFactLoadingMessageApi from "@api/birdFactLoadingMessageApi";
import BirdFactTopicApi from "@api/birdFactTopicApi";
import HelperApi from "@api/helperApi";
import MastodonApi from "@api/mastodonApi";
import MastodonBirdFactApi from "@api/mastodonBirdFactApi";
import OpenAiApi from "@api/openAiApi";
import PredictionApi from "@api/predictionApi";
import TwitchApi from "@api/twitchApi";
import EmoTrackerApi from "./emoTrackerApi";
import CreditsApi from "./creditsApi";

const registerAllEndpoints = () => {
  BirdFactApi.registerEndpoints();
  BirdFactTopicApi.registerEndpoints();
  BirdFactLoadingMessageApi.registerEndpoints();
  CreditsApi.registerEndpoints();
  EmoTrackerApi.registerEndpoints();
  HelperApi.registerEndpoints();
  OpenAiApi.registerEndpoints();
  PredictionApi.registerEndpoints();
  MastodonApi.registerEndpoints();
  MastodonBirdFactApi.registerEndpoints();
  TwitchApi.registerEndpoints();
};
export default registerAllEndpoints;
