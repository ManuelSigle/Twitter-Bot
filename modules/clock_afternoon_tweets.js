const get_random_minute = () => {
    let temp = Math.floor(Math.random() * 60) + 1;
    return temp;
}

const get_random_hour = () => {
    let temp = Math.floor(Math.random() * (18 - 12 + 1)) + 12;
    return temp;
}

const get_clock_for_tweets = () => {
    let clock_tweets = [];
    let tweets_hour_array = [];
    let tweet_minutes_array = [];

    for (i = 0; i < Math.floor(Math.random() * 4) + 2; i++) {
        tweets_hour_array.push(get_random_hour());
        tweet_minutes_array.push(get_random_minute());

        let temp_hour;
        let temp_minutes;

        if (tweets_hour_array[i] < 10) {
            temp_hour = "0" + tweets_hour_array[i]
        } else {
            temp_hour = tweets_hour_array[i];
        }
        if (tweet_minutes_array[i] < 10) {
            temp_minutes = "0" + tweet_minutes_array[i];
        } else {
            temp_minutes = tweet_minutes_array[i]
        }

        clock_tweets.push(temp_hour + ":" + temp_minutes);
    }

    return delet_all_dublicates(clock_tweets);
}

const delet_all_dublicates = (clocks) => {
    return uniqueClocks = [...new Set(clocks)];
}


module.exports = get_clock_for_tweets;