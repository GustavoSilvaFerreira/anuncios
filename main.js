require('dotenv').config();
const Ad = require('./ad');

(async () => {
    const adverts = new Ad();
    const dateFirstPost = {
        day: 26,
        month: 4,
        year: 2026
    }
    try {
        await adverts.step1FilesForCreateVideos(dateFirstPost);
        process.exit(0);
    } catch (error) {
        console.error('Erro fatal:', error.message);
        process.exit(1);
    }
})();

// const VideoService = require('./services/video.service');
// const videoService = new VideoService();
// videoService.teste();

// const YoutubeService = require('./services/youtube.service');
// const youtubeService = new YoutubeService();
// youtubeService.search('');