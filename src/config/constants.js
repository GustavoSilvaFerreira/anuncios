const { File } = require("../modules/storage");
const { Logger } = require("../shared/utils");
const { RAIZ } = require("./directory.config");

const secrets = Object.freeze({
    youtubeApiKey: process.env.YOUTUBE_API_KEY ? File.getFileContentSync(`${RAIZ}${process.env.YOUTUBE_API_KEY}`) : null
});

const CONSTANTS = {
    secrets,
    error: {
        FILE_LENGTH_ERROR_MESSAGE: 'The content length is invalid!',
        FILE_FIELDS_ERROR_MESSAGE: 'The provided properties are invalid!'
    }
}

module.exports = CONSTANTS;