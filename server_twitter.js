console.log("Server startet!");
const private_stuff = require("./private/privat_stuff.json");
const mysql = require("mysql");
const express = require("express");
const app = express();

app.listen(80);

const sql_conf = require("./private/sql_conf.json");
const sql_con = mysql.createConnection({
    host: sql_conf.host,
    user: sql_conf.user,
    password: sql_conf.password,
    database: sql_conf.database,
});
sql_con.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
});

const TwitterApi = require('twitter-api-v2').default;
const twitter_conf = require("./private/twitter_Api_config.json");
const twitterClient = new TwitterApi({
    clientId: twitter_conf.clientId,
    clientSecret: twitter_conf.clientSecret,
});

const { Configuration, OpenAIApi } = require("openai");
const openai_conf = require("./private/openai_config.json");
const configuration = new Configuration({
    organization: openai_conf.organization,
    apiKey: openai_conf.apiKey,
});
const openai = new OpenAIApi(configuration);


callbackURL = private_stuff.callbackURL;

app.get("/", (req, res) => {
    res.send("Hallo");
    res.end();
});

app.get("/getAPI", (req, res) => {
    const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
        callbackURL, { scope: ["tweet.read", "tweet.write", "users.read", "offline.access"] }
    );

    sql_con.query("INSERT INTO Twitter_Bot (codeVerifier, state) VALUE (?, ?)", [codeVerifier, state]);

    res.redirect(url);
});

app.get(private_stuff.slash_callbackURL, (req, res) => {
    var state = req.query.state;
    var code = req.query.code;

    sql_con.query("SELECT state FROM Twitter_Bot WHERE state = ?", [state], (err, data, fields) => {
        if (data.length > 0) {
            console.log("state ist gleich");
        }
    });

    sql_con.query("SELECT codeVerifier FROM Twitter_Bot WHERE state = ?", [state], async(err, data, fields) => {
        var codeVerifier = data[0].codeVerifier;

        const user = {
            client: loggedClient,
            accessToken,
            refreshToken,
        } = await twitterClient.loginWithOAuth2({
            code,
            codeVerifier,
            redirectUri: callbackURL,
        });

        sql_con.query("UPDATE Twitter_Bot SET accessToken = ?, refreshToken = ?", [user.accessToken, user.refreshToken]);

        const me = await loggedClient.v2.me();
        res.send(me);
    });
});

app.get("/tweet", (req, res) => {
    sql_con.query("SELECT refreshToken FROM Twitter_Bot", async(err, data, fields) => {
        const refreshed_User = {
            client: refreshedClient,
            accessToken,
            refreshToken: newRefreshToken,
        } = await twitterClient.refreshOAuth2Token(data[0].refreshToken);

        sql_con.query("UPDATE Twitter_Bot SET accessToken = ?, refreshToken = ?", [refreshed_User.accessToken, refreshed_User.refreshToken]);

        const aiContent = await openai.createCompletion('text-davinci-001', {
            prompt: "Daily routine #lifetweet",
            max_tokens: 64,
        });

        //*Adding an Emoji
        let tweet_content = aiContent.data.choices[0].text + '🐒';

        const tweet = await refreshedClient.v2.tweet(
            tweet_content
        );

        res.send(tweet);
    });
});