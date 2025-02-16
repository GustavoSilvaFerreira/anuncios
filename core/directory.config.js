
const { join } = require('path');
const RAIZ = join(__dirname, "../");
const DIR_FILES = join(RAIZ, "files");
const DIR_FONT = join(DIR_FILES, "font");
const DIR_VIDEOS = join(DIR_FILES, "videos");
const DIR_TEMP = join(RAIZ, "temp");
const DIR_TO_POST = join(DIR_TEMP, "toPost");
const DIR_TO_CREATE = join(DIR_TEMP, "toCreate");
const FILE_FOR_CREATE = join(DIR_FILES, 'forCreateAd.txt');
// const DIR_VIDEOS = join(RAIZ, "../../", "Downloads");

module.exports = {
    DIR_TO_POST,
    DIR_TO_CREATE,
    DIR_TEMP,
    DIR_VIDEOS,
    FILE_FOR_CREATE,
    DIR_FONT
}