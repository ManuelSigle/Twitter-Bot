const mysql = require("mysql");
const sql_conf = require("../../private/configs/sql_config_twitter_Bot.json");
const TwitterApi = require('twitter-api-v2').default;
const fs = require("fs");

const twitter_conf = require("../../private/configs/twitter_Api_config.json");
const { Configuration, OpenAIApi } = require("openai");
const openai_conf = require("../../private/configs/openai_config.json");
const configuration = new Configuration({
    organization: openai_conf.organization,
    apiKey: openai_conf.apiKey,
});

const openai = new OpenAIApi(configuration);
const sql_con = mysql.createConnection({
    host: sql_conf.host,
    user: sql_conf.user,
    password: sql_conf.password,
    database: sql_conf.database,
});

const twitterClient = new TwitterApi({
    clientId: twitter_conf.clientId,
    clientSecret: twitter_conf.clientSecret,
});

const morning_tweets = require("../modules/clock_morning_tweets");
const afternoon_tweets = require("../modules/clock_afternoon_tweets");
const evening_tweets = require("../modules/clock_evening_tweets");
const compare_time = require("../modules/compare_time_module");

var clock_morning_tweets;
var clock_afternoon_tweets;
var clock_evening_tweets;

const creat_new_day = () => {
    clock_morning_tweets = morning_tweets();
    clock_afternoon_tweets = afternoon_tweets();
    clock_evening_tweets = evening_tweets();

    let buffer = "Morning: " + clock_morning_tweets + "\n" + "Afternoon: " + clock_afternoon_tweets + "\n" + "Evening: " + clock_evening_tweets + "\n";

    fs.open("../log.txt", "a", (err, fd) => {
        fs.write(fd, buffer, (err) => {});
    });

    console.log("Tweets for Today: ");
    console.log("Morning: " + clock_morning_tweets);
    console.log("Afternoon: " + clock_afternoon_tweets);
    console.log("Evening: " + clock_evening_tweets);
}

const tweet = () => {
    sql_con.query("SELECT refreshToken FROM Twitter_Bot", async(err, data, fields) => {
        const refreshed_User = {
            client: refreshedClient,
            accessToken,
            refreshToken: newRefreshToken,
        } = await twitterClient.refreshOAuth2Token(data[0].refreshToken);

        sql_con.query("UPDATE Twitter_Bot SET accessToken = ?, refreshToken = ?", [refreshed_User.accessToken, refreshed_User.refreshToken]);

        const aiContent = await openai.createCompletion('text-curie-001', {
            prompt: "Write a funny tweet #tweet",
            max_tokens: 64,
        });

        //*Edeting the Text.
        let tweet_content = aiContent.data.choices[0].text;

        const tweet = await refreshedClient.v2.tweet(
            tweet_content
        );

        let date = new Date();

        fs.open("../log.txt", "a", (err, fd) => {
            fs.write(fd, date + tweet_content + "\n", (err) => {});
        })

        console.log(tweet);
    });
}

const tweet_check = () => {
    if (compare_time(clock_morning_tweets)) {
        console.log("Morning Tweet!");
        tweet()();
    } else if (compare_time(clock_afternoon_tweets)) {
        console.log("Afternoon Tweet!");
        tweet();
    } else if (compare_time(clock_evening_tweets)) {
        console.log("Evening twet!");
        tweet();
    } else {
        console.log("Kein Tweet!");
    }
}

module.exports = { tweet_check, creat_new_day }