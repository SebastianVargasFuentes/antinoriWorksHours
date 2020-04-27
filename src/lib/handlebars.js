//Import the timeago.js to transform the timestamp format
const {format} = require('timeago.js');

//creating a object named helpers, this constains all
const helpers = {};

//transform the timestamp
helpers.timeago = (timestamp) => {
    return format(timestamp);
};

module.exports = helpers;