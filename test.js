require('dotenv').config();
const { YoutubeService } = require('./src/modules/youtube');

const youtubeService = new YoutubeService();
youtubeService.search('');