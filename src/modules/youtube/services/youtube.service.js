const RestService = require('../../storage/services/rest.service');
const CONSTANTS = require('../../../config/constants');
const ENDPOINTS = require('../../../config/url.config');
const { Logger, ValidationUtils } = require('../../../shared/utils');
const CoffeScript = require('coffee-script');
CoffeScript.register();
const gapi = require('gapi');

const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');

class YoutubeService {
    restService = null;
    key = CONSTANTS.secrets.youtubeApiKey;

    constructor(
        restService = new RestService()
    ) {
        this.restService = restService;
        this._validateApiKey();
    }

    /**
     * Valida se a chave da API está configurada
     */
    _validateApiKey() {
        if (!this.key) {
            Logger.error('YouTube API Key não configurada em CONSTANTS.secrets.youtubeApiKey');
        }
    }

    /**
     * Busca vídeos no YouTube por termo de pesquisa
     * @param {string} searchQuery - Termo de pesquisa
     * @param {string} channelId - ID do canal (opcional)
     * @returns {Promise<Object>} Resultado da busca
     */
    async searchVideos(searchQuery, channelId = 'UCEsHJAZezJSuOUEqLJ3t2dg') {
        try {
            // Validações usando ValidationUtils
            if (!ValidationUtils.validateString(searchQuery, 1)) {
                Logger.warn('Parâmetro searchQuery inválido ou vazio');
                return null;
            }

            if (!ValidationUtils.validateString(channelId, 1)) {
                Logger.warn('Parâmetro channelId inválido');
                return null;
            }

            Logger.info(`Iniciando busca no YouTube: "${searchQuery}"`);

            const youtube = google.youtube({
                version: 'v3',
                auth: this.key
            });

            const response = await youtube.search.list({
                part: 'id,snippet',
                q: searchQuery,
                channelId: channelId,
                maxResults: 10
            });

            const totalResults = response.data.pageInfo.totalResults;
            Logger.success(`Busca concluída. Total de resultados: ${totalResults}`);
            
            return response.data;

        } catch (error) {
            Logger.error('Erro ao buscar vídeos no YouTube', error);
            throw error;
        }
    }

    /**
     * Busca detalhes de um vídeo específico
     * @param {string} videoId - ID do vídeo
     * @returns {Promise<Object>} Detalhes do vídeo
     */
    async getVideoDetails(videoId) {
        try {
            if (!ValidationUtils.validateString(videoId, 1)) {
                Logger.warn('Parâmetro videoId inválido');
                return null;
            }

            Logger.info(`Buscando detalhes do vídeo: ${videoId}`);

            const youtube = google.youtube({
                version: 'v3',
                auth: this.key
            });

            const response = await youtube.videos.list({
                part: 'id,status,contentDetails,snippet',
                id: videoId
            });

            if (response.data.items && response.data.items.length > 0) {
                Logger.success(`Vídeo encontrado: ${response.data.items[0].snippet.title}`);
                return response.data.items[0];
            } else {
                Logger.warn(`Nenhum vídeo encontrado com ID: ${videoId}`);
                return null;
            }

        } catch (error) {
            Logger.error('Erro ao obter detalhes do vídeo', error);
            throw error;
        }
    }

    /**
     * Busca (compatível com interface anterior)
     * @deprecated Use searchVideos() instead
     */
    async search(searchQuery) {
        Logger.warn('Método search() está deprecated. Use searchVideos() ao invés.');
        return this.searchVideos(searchQuery);
    }
}

module.exports = YoutubeService;