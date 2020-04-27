const helpers = {};
const brcrypt = require('bcryptjs');

helpers.encryptPassword = async (password) => {
    const salt = await brcrypt.genSalt(10);
    const hash = await brcrypt.hash(password,salt);
    return hash;
};

helpers.matchPassword = async (password,savedPassword) => {
    return await brcrypt.compare(password,savedPassword);
};

module.exports = helpers;