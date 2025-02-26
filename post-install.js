const File = require('./services/file.service');
const { DIR_TO_CREATE, DIR_TO_POST, DIR_TEMP } = require('./core/directory.config');

async function run() {
    if(!File.existsSync(DIR_TEMP)) {
        await File.mkdir(DIR_TEMP);
    }
    if(!File.existsSync(DIR_TO_CREATE)) {
        await File.mkdir(DIR_TO_CREATE);
    }
    if(!File.existsSync(DIR_TO_POST)) {
        await File.mkdir(DIR_TO_POST);
    }
};
run();