const { Logger, ValidationUtils, StringUtils, ArrayUtils, TextFormatter } = require('../../../shared/utils');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { DIR_TEMP, DIR_TO_POST } = require('../../../config/directory.config');

class YouTubePublisherService {
    constructor(youtubeService, videoService, channelContext) {
        this.youtubeService = youtubeService;
        this.videoService = videoService;
        this.channelContext = channelContext;
        this.publicationQueue = [];
        this.scheduledVideos = new Map();
    }
    
    /**
     * Fluxo completo: Upload → Agendar (vídeo já existe)
     * @param {Object} postData - Dados do post
     * @param {string} videoPath - Caminho do vídeo já criado
     * @param {Date} publishAt - Data/horário de publicação
     * @returns {Promise<Object>} Resultado completo
     */
    async processVideoPublication(postData, videoPath, publishAt = null) {
        try {
            Logger.info(`Iniciando processo de publicação: ${postData.titleVideo}`);
            
            // 1. Validar que vídeo existe
            if (!ValidationUtils.validateFileExists(videoPath)) {
                throw new Error(`Arquivo de vídeo não encontrado: ${videoPath}`);
            }
            
            Logger.info(`Vídeo encontrado: ${videoPath}`);
            
            // 2. Fazer upload para YouTube
            const uploadResult = await this.uploadToYouTube(videoPath, postData);
            Logger.info(`Vídeo uploadado: ${uploadResult.videoId}`);
            
            // 3. Agendar ou publicar
            const publishResult = publishAt 
                ? await this.scheduleVideo(uploadResult.videoId, publishAt)
                : await this.publishVideo(uploadResult.videoId);
            
            // 4. Salvar no banco local
            await this.savePublicationRecord({
                ...postData,
                videoId: uploadResult.videoId,
                videoPath: videoPath,
                publishAt: publishResult.scheduledAt || publishResult.publishedAt,
                status: publishResult.status,
                createdAt: new Date()
            });
            
            Logger.success(`Processo concluído: ${postData.titleVideo}`);
            return {
                success: true,
                videoId: uploadResult.videoId,
                status: publishResult.status,
                publishAt: publishResult.scheduledAt || publishResult.publishedAt,
                videoPath: videoPath
            };
            
        } catch (error) {
            Logger.error('Erro no processo de publicação', error);
            throw error;
        }
    }
    
    /**
     * Publica vídeo existente no YouTube (upload + agendamento)
     * @param {Object} postData - Dados do post com metadados já formatados
     * @param {string} videoPath - Caminho do vídeo já criado
     * @param {Date} publishAt - Data/horário de publicação
     * @returns {Promise<Object>} Resultado completo
     */
    async publishExistingVideo(postData, videoPath, publishAt = null) {
        try {
            Logger.info(`Publicando vídeo existente: ${postData.titleVideo}`);
            
            // 1. Validar que vídeo existe
            if (!ValidationUtils.validateFileExists(videoPath)) {
                throw new Error(`Arquivo de vídeo não encontrado: ${videoPath}`);
            }
            
            Logger.info(`Vídeo encontrado: ${videoPath}`);
            
            // 2. Fazer upload para YouTube diretamente
            const uploadResult = await this.youtubeService.uploadVideo(videoPath, {
                title: postData.titleVideo,
                description: postData.youtubeDescription,
                tags: postData.hashtags || [],
                categoryId: '22', // Entertainment
                privacy: 'private' // Private inicialmente
            });
            Logger.info(`Vídeo uploadado: ${uploadResult.videoId}`);
            
            // 3. Agendar ou publicar diretamente
            const publishResult = publishAt 
                ? await this.youtubeService.scheduleVideo(uploadResult.videoId, publishAt)
                : await this.youtubeService.publishVideo(uploadResult.videoId);
            
            // 4. Salvar no banco local
            await this.savePublicationRecord({
                ...postData,
                videoId: uploadResult.videoId,
                videoPath: videoPath,
                publishAt: publishResult.scheduledAt || publishResult.publishedAt,
                status: publishResult.status,
                createdAt: new Date()
            });
            
            Logger.success(`Processo concluído: ${postData.titleVideo}`);
            return {
                success: true,
                videoId: uploadResult.videoId,
                status: publishResult.status,
                publishAt: publishResult.scheduledAt || publishResult.publishedAt,
                videoPath: videoPath
            };
            
        } catch (error) {
            Logger.error('Erro no processo de publicação', error);
            throw error;
        }
    }
    
    /**
     * Limpa arquivo temporário
     * @param {string} videoPath - Caminho do arquivo
     */
    async cleanupTempFile(videoPath) {
        try {
            if (fsSync.existsSync(videoPath)) {
                await fs.unlink(videoPath);
                Logger.info(`Arquivo temporário removido: ${videoPath}`);
            }
        } catch (error) {
            Logger.warn('Erro ao remover arquivo temporário', error);
        }
    }
    
    /**
     * Salva registro de publicação
     * @param {Object} record - Dados da publicação
     */
    async savePublicationRecord(record) {
        try {
            const recordsFile = path.join(DIR_TEMP, 'youtube-publications.json');
            
            let records = [];
            if (fsSync.existsSync(recordsFile)) {
                const content = fsSync.readFileSync(recordsFile, 'utf8');
                records = JSON.parse(content);
            }
            
            records.push(record);
            fsSync.writeFileSync(recordsFile, JSON.stringify(records, null, 2));
            
            Logger.info(`Registro salvo: ${record.videoId}`);
        } catch (error) {
            Logger.error('Erro ao salvar registro de publicação', error);
            // NãoThrow para não interromper o fluxo principal
        }
    }
    
    /**
     * Obtém publicações agendadas
     * @returns {Array} Lista de vídeos agendados
     */
    getScheduledVideos() {
        try {
            const recordsFile = path.join(DIR_TEMP, 'youtube-publications.json');
            
            if (!fsSync.existsSync(recordsFile)) return [];
            
            const content = fsSync.readFileSync(recordsFile, 'utf8');
            const records = JSON.parse(content);
            
            return records.filter(record => 
                record.status === 'scheduled' && 
                new Date(record.publishAt) > new Date()
            );
        } catch (error) {
            Logger.error('Erro ao obter vídeos agendados', error);
            return [];
        }
    }
    
    /**
     * Processa publicações agendadas
     */
    async processScheduledPublications() {
        const scheduled = this.getScheduledVideos();
        
        if (scheduled.length === 0) {
            Logger.info('Nenhuma publicação agendada para processar');
            return;
        }
        
        Logger.info(`Processando ${scheduled.length} publicações agendadas`);
        
        for (const record of scheduled) {
            const now = new Date();
            const publishTime = new Date(record.publishAt);
            
            if (publishTime <= now) {
                try {
                    Logger.info(`Processando publicação agendada: ${record.videoId}`);
                    await this.publishVideo(record.videoId);
                    
                    // Atualizar status no registro
                    record.status = 'published';
                    record.publishedAt = now;
                    await this.savePublicationRecord(record);
                    
                } catch (error) {
                    Logger.error(`Erro em publicação agendada: ${record.videoId}`, error);
                    record.status = 'error';
                    record.error = error.message;
                    await this.savePublicationRecord(record);
                }
            }
        }
    }
    
    /**
     * Obtém status de publicação de um vídeo
     * @param {string} videoId - ID do vídeo
     * @returns {Promise<Object>} Status completo
     */
    async getPublicationStatus(videoId) {
        try {
            const youtubeStatus = await this.youtubeService.getVideoPublishStatus(videoId);
            const localStatus = this.getLocalPublicationStatus(videoId);
            
            return {
                youtube: youtubeStatus,
                local: localStatus,
                combined: {
                    videoId: videoId,
                    status: localStatus?.status || youtubeStatus?.status || 'unknown',
                    publishAt: localStatus?.publishAt || youtubeStatus?.publishAt,
                    publishedAt: localStatus?.publishedAt || youtubeStatus?.publishedAt,
                    stats: youtubeStatus ? {
                        views: youtubeStatus.viewCount,
                        likes: youtubeStatus.likeCount,
                        comments: youtubeStatus.commentCount
                    } : null
                }
            };
        } catch (error) {
            Logger.error('Erro ao obter status de publicação', error);
            return null;
        }
    }
    
    /**
     * Obtém status local de publicação
     * @param {string} videoId - ID do vídeo
     * @returns {Object} Status local
     */
    getLocalPublicationStatus(videoId) {
        try {
            const recordsFile = path.join(DIR_TEMP, 'youtube-publications.json');
            
            if (!fsSync.existsSync(recordsFile)) return null;
            
            const content = fsSync.readFileSync(recordsFile, 'utf8');
            const records = JSON.parse(content);
            
            return records.find(record => record.videoId === videoId) || null;
        } catch (error) {
            Logger.error('Erro ao obter status local', error);
            return null;
        }
    }
    
    /**
     * Cancela publicação agendada
     * @param {string} videoId - ID do vídeo
     * @returns {Promise<Object>} Resultado
     */
    async cancelScheduledPublication(videoId) {
        try {
            // Remover agendamento no YouTube
            const result = await this.youtubeService.publishVideo(videoId);
            
            // Atualizar status local
            const record = this.getLocalPublicationStatus(videoId);
            if (record) {
                record.status = 'cancelled';
                record.cancelledAt = new Date();
                await this.savePublicationRecord(record);
            }
            
            Logger.success(`Publicação cancelada: ${videoId}`);
            return {
                success: true,
                videoId: videoId,
                status: 'cancelled'
            };
        } catch (error) {
            Logger.error('Erro ao cancelar publicação', error);
            throw error;
        }
    }
}

module.exports = YouTubePublisherService;
