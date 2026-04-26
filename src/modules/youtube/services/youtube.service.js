const RestService = require('../../storage/services/rest.service');
const CONSTANTS = require('../../../config/constants');
const { Logger, ValidationUtils, StringUtils } = require('../../../shared/utils');
const fs = require('fs');
const path = require('path');
const { DIR_TEMP } = require('../../../config/directory.config');

const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');

class YoutubeService {
    restService = null;
    key = CONSTANTS.secrets.youtubeApiKey;
    clientId = CONSTANTS.secrets.youtubeClientId;
    clientSecret = CONSTANTS.secrets.youtubeClientSecret;
    uploadProgress = new Map();

    constructor(
        restService = new RestService()
    ) {
        this.restService = restService;
        this._validateCredentials();
    }

    /**
     * Valida se as credenciais estão configuradas
     */
    _validateCredentials() {
        if (!this.key) {
            Logger.error('YouTube API Key não configurada em CONSTANTS.secrets.youtubeApiKey');
        }
        if (!this.clientId || !this.clientSecret) {
            Logger.warn('YouTube OAuth 2.0 credentials não configuradas - upload não funcionará');
        }
    }

    /**
     * Obtém cliente OAuth2 autenticado para upload (backend com refresh token)
     */
    async _getOAuth2Client() {
        const YouTubeOAuthService = require('./youtube-oauth.service');
        const oauthService = new YouTubeOAuthService();
        
        return await oauthService.getAuthenticatedClient();
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
                auth: await this._getOAuth2Client()
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
                auth: await this._getOAuth2Client()
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

    /**
     * Faz upload de vídeo para YouTube
     * @param {string} videoPath - Caminho do arquivo de vídeo
     * @param {Object} metadata - Metadados do vídeo
     * @returns {Promise<Object>} Resultado do upload
     */
    async uploadVideo(videoPath, metadata = {}) {
        try {
            if (!ValidationUtils.validateFileExists(videoPath)) {
                throw new Error(`Arquivo de vídeo não encontrado: ${videoPath}`);
            }
            
            const youtube = google.youtube({
                version: 'v3',
                auth: await this._getOAuth2Client()
            });
            
            // 1. Iniciar upload
            const fileSize = fs.statSync(videoPath).size;
            const videoMetadata = {
                snippet: {
                    title: metadata.title || 'Vídeo Sem Título',
                    description: metadata.description || '',
                    tags: metadata.tags || [],
                    categoryId: metadata.categoryId || '22', // Entertainment
                    defaultLanguage: 'pt',
                    defaultAudioLanguage: 'pt'
                },
                status: {
                    privacyStatus: metadata.privacy || 'private', // private para agendamento
                    publishAt: metadata.publishAt || null,
                    selfDeclaredMadeForKids: false
                }
            };
            
            Logger.info(`Iniciando upload do vídeo: ${metadata.title}`);
            this.uploadProgress.set(videoPath, { status: 'uploading', progress: 0 });
            
            const response = await youtube.videos.insert({
                part: 'snippet,status',
                requestBody: videoMetadata,
                media: {
                    body: fs.createReadStream(videoPath),
                    mimeType: 'video/mp4'
                }
            }, {
                onUploadProgress: (evt) => {
                    const progress = (evt.bytesRead / fileSize) * 100;
                    this.uploadProgress.set(videoPath, { 
                        status: 'uploading', 
                        progress: Math.round(progress) 
                    });
                    Logger.info(`Upload progress: ${Math.round(progress)}%`);
                }
            });
            
            const videoId = response.data.id;
            this.uploadProgress.set(videoPath, { 
                status: 'uploaded', 
                videoId: videoId,
                progress: 100 
            });
            
            Logger.success(`Vídeo uploadado com sucesso: ${videoId}`);
            return {
                success: true,
                videoId: videoId,
                uploadUrl: `https://www.youtube.com/watch?v=${videoId}`,
                metadata: response.data
            };
            
        } catch (error) {
            this.uploadProgress.set(videoPath, { 
                status: 'error', 
                error: error.message 
            });
            Logger.error('Erro ao fazer upload do vídeo', error);
            throw new Error(`Falha no upload: ${error.message}`);
        }
    }
    
    /**
     * Agenda publicação de vídeo já uploadado
     * @param {string} videoId - ID do vídeo
     * @param {Date} publishAt - Data/horário de publicação
     * @returns {Promise<Object>} Resultado do agendamento
     */
    async scheduleVideo(videoId, publishAt) {
        try {
            if (!ValidationUtils.validateString(videoId, 1)) {
                throw new Error('Video ID inválido');
            }
            
            if (!publishAt || !(publishAt instanceof Date)) {
                throw new Error('Data de publicação inválida');
            }
            
            // Validar se data é futura (mínimo 2 minutos)
            const minPublishTime = new Date(Date.now() + (2 * 60 * 1000));
            if (publishAt < minPublishTime) {
                throw new Error('Data de publicação deve ser pelo menos 2 minutos no futuro');
            }
            
            const youtube = google.youtube({
                version: 'v3',
                auth: await this._getOAuth2Client()
            });
            
            const response = await youtube.videos.update({
                part: 'status',
                id: videoId,
                requestBody: {
                    id: videoId,
                    status: {
                        privacyStatus: 'private',
                        publishAt: publishAt.toISOString()
                    }
                }
            });
            
            Logger.success(`Vídeo ${videoId} agendado para ${publishAt.toLocaleString('pt-BR')}`);
            return {
                success: true,
                videoId: videoId,
                scheduledAt: publishAt,
                status: 'scheduled'
            };
            
        } catch (error) {
            Logger.error('Erro ao agendar vídeo', error);
            throw new Error(`Falha no agendamento: ${error.message}`);
        }
    }
    
    /**
     * Publica vídeo imediatamente
     * @param {string} videoId - ID do vídeo
     * @returns {Promise<Object>} Resultado da publicação
     */
    async publishVideo(videoId) {
        try {
            const youtube = google.youtube({
                version: 'v3',
                auth: await this._getOAuth2Client()
            });
            
            const response = await youtube.videos.update({
                part: 'status',
                id: videoId,
                requestBody: {
                    id: videoId,
                    status: {
                        privacyStatus: 'public'
                    }
                }
            });
            
            Logger.success(`Vídeo ${videoId} publicado com sucesso`);
            return {
                success: true,
                videoId: videoId,
                publishedAt: new Date(),
                status: 'published'
            };
            
        } catch (error) {
            Logger.error('Erro ao publicar vídeo', error);
            throw new Error(`Falha na publicação: ${error.message}`);
        }
    }
    
    /**
     * Obtém status do upload
     * @param {string} videoPath - Caminho do vídeo
     * @returns {Object} Status atual
     */
    getUploadStatus(videoPath) {
        return this.uploadProgress.get(videoPath) || { 
            status: 'not_started', 
            progress: 0 
        };
    }
    
    /**
     * Obtém detalhes completos do vídeo
     * @param {string} videoId - ID do vídeo
     * @returns {Promise<Object>} Detalhes incluindo status de publicação
     */
    async getVideoPublishStatus(videoId) {
        try {
            const videoDetails = await this.getVideoDetails(videoId);
            if (!videoDetails) return null;
            
            return {
                videoId: videoId,
                title: videoDetails.snippet.title,
                status: videoDetails.status.privacyStatus,
                publishAt: videoDetails.status.publishAt ? new Date(videoDetails.status.publishAt) : null,
                viewCount: videoDetails.statistics?.viewCount || 0,
                likeCount: videoDetails.statistics?.likeCount || 0,
                commentCount: videoDetails.statistics?.commentCount || 0
            };
        } catch (error) {
            Logger.error('Erro ao obter status de publicação', error);
            return null;
        }
    }
}

module.exports = YoutubeService;
