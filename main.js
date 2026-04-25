require('dotenv').config();
const { Ad } = require('./src');
const { FILE_DATE_FIRST_POST } = require('./src/config/directory.config');
const { File } = require('./src/modules/storage');
const dateFirstPostTxt = File.getFileContentSync(FILE_DATE_FIRST_POST);
const [day, month, year] = dateFirstPostTxt.split('/').map(Number);

(async () => {
    const adverts = new Ad();
    const dateFirstPost = {
        day,
        month,
        year
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