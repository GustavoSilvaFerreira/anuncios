const axios = require('axios');
const File = require('./file.service');

class RestService {
    constructor() {
        this.lastRequestTime = 0;
        this.requestDelay = 1000; // 1 segundo entre requisições
        this.defaultHeaders = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0'
        };
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async get(url, options = {}) {
        // Aguarda delay mínimo entre requisições
        const timeSinceLastRequest = Date.now() - this.lastRequestTime;
        if (timeSinceLastRequest < this.requestDelay) {
            await this.delay(this.requestDelay - timeSinceLastRequest);
        }
        this.lastRequestTime = Date.now();

        // Merge headers padrão com os fornecidos
        const headers = {
            ...this.defaultHeaders,
            ...(options.headers || {})
        };

        return axios.get(url, {
            ...options,
            headers,
            timeout: 10000
        });
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