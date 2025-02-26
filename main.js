require('dotenv').config();
const Ad = require('./ad');
const adverts = new Ad();
const dateFirstPost = {
    day: 27,
    month: 2,
    year: 2025
}
adverts.step1FilesForCreateVideos(dateFirstPost);

// const VideoService = require('./services/video.service');
// const videoService = new VideoService();
// videoService.teste();

// const YoutubeService = require('./services/youtube.service');
// const youtubeService = new YoutubeService();
// youtubeService.search('');