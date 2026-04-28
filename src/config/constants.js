const { File } = require("../modules/storage");
const { Logger } = require("../shared/utils");
const { RAIZ } = require("./directory.config");

const secrets = Object.freeze({
    youtubeApiKey: process.env.YOUTUBE_API_KEY ? File.getFileContentSync(`${RAIZ}${process.env.YOUTUBE_API_KEY}`) : null,
    youtubeClientId: process.env.YOUTUBE_CLIENT_ID ? File.getFileContentSync(`${RAIZ}${process.env.YOUTUBE_CLIENT_ID}`) : null,
    youtubeClientSecret: process.env.YOUTUBE_CLIENT_SECRET ? File.getFileContentSync(`${RAIZ}${process.env.YOUTUBE_CLIENT_SECRET}`) : null
});

const CONSTANTS = {
    secrets,
    error: {
        FILE_LENGTH_ERROR_MESSAGE: 'The content length is invalid!',
        FILE_FIELDS_ERROR_MESSAGE: 'The provided properties are invalid!'
    }
}

module.exports = CONSTANTS;