import BirdFactApi from "@api/birdFactApi";
import BirdFactLoadingMessageApi from "@api/birdFactLoadingMessageApi";
import BirdFactTopicApi from "@api/birdFactTopicApi";
import HelperApi from "@api/helperApi";
import MastodonApi from "@api/mastodonApi";
import MastodonBirdFactApi from "@api/mastodonBirdFactApi";
import OpenAiApi from "@api/openAiApi";
import PredictionApi from "@api/predictionApi";
import TwitchApi from "@api/twitchApi";

const registerAllEndpoints = () => {
    HelperApi.registerEndpoints();
    OpenAiApi.registerEndpoints();
    PredictionApi.registerEndpoints();
    BirdFactApi.registerEndpoints();
    BirdFactTopicApi.registerEndpoints();
    BirdFactLoadingMessageApi.registerEndpoints();
    MastodonApi.registerEndpoints();
    MastodonBirdFactApi.registerEndpoints();
    TwitchApi.registerEndpoints();
}
export default registerAllEndpoints;
