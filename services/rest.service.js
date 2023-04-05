const axios = require('axios');
const File = require('./file.service');

class RestService {
    get(url, options = {}) {
        return axios.get(url, options);
    }

    downloadImage(url, filePath) {
        const options = {
            responseType: 'stream'
        }
        return this.get(url, options).then(response => {
            return new Promise((resolve, reject) => {
                response.data
                    .pipe(File.createWriteStream(filePath))
                    .on('finish', () => resolve(true))
                    .on('error', e => reject(e));
            });
        });
    }
}

module.exports = RestService;