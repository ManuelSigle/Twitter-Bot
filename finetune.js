const { Configuration, OpenAIApi } = require("openai");
const openai_conf = require("../../private/configs/openai_config.json");
const configuration = new Configuration({
    organization: openai_conf.organization,
    apiKey: openai_conf.apiKey,
});

const openai = new OpenAIApi(configuration);