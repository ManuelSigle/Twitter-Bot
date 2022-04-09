const compare_time = (clocks) => {
    var date = new Date();
    var date_hour = date.getHours();
    var date_minutes = date.getMinutes();

    if (date_hour < 10) {
        date_hour = "0" + date_hour;
    }
    if (date_minutes < 10) {
        date_minutes = "0" + date_minutes;
    }
    var time = date_hour + ":" + date_minutes;

    try {
        for (var i = 0; i < clocks.length; i++) {
            if (clocks[i] == time) {
                return true;
            }
        }
    } catch (error) {
        console.log("Es wurde noch kein Tag erstellt. ");
        console.log("Erstelle neuen Tag ...");

        const twitter_bot_module = require("./twitter_bot_module");
        twitter_bot_module.creat_new_day();
    }
    return false;
}


module.exports = compare_time;