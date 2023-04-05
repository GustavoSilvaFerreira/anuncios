require('dotenv').config();
const Ad = require('./ad');
const adverts = new Ad();
const dateFirstPost = {
    day: 6,
    month: 4,
    year: 2023
}
adverts.step1FilesForCreateVideos(dateFirstPost);
// adverts.step2FilesForTitleCommentsAndRenameVideos();
// adverts.teste();

const VideoService = require('./services/video.service');
const videoService = new VideoService();
// videoService.teste();