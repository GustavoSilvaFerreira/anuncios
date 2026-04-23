require('dotenv').config();
const Ad = require('./ad');
const adverts = new Ad();
const dateFirstPost = {
    day: 24,
    month: 4,
    year: 2026
}
adverts.step1FilesForCreateVideos(dateFirstPost);

// const VideoService = require('./services/video.service');
// const videoService = new VideoService();
// videoService.teste();

// const YoutubeService = require('./services/youtube.service');
// const youtubeService = new YoutubeService();
// youtubeService.search('');