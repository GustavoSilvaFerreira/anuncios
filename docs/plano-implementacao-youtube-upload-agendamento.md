# Plano de Implementação: Integração YouTube Upload e Agendamento

Plano completo para implementar integração com YouTube API permitindo upload de vídeos e agendamento de posts após a criação do conteúdo.

## 📋 Visão Geral

Estender a funcionalidade atual do YoutubeService (apenas busca/leitura) para suportar upload de vídeos e agendamento de publicação, criando um fluxo completo: criação → upload → agendamento → publicação.

## 🎯 Objetivos

- ✅ Implementar upload de vídeos para YouTube
- ✅ Criar sistema de agendamento de posts
- ✅ Integrar com fluxo atual de criação de vídeos
- ✅ Suportar múltiplos canais (multi-tenant)
- ✅ Gerenciar status de publicação
- ✅ Tratamento de erros e retry

## 🚨 Análise da Estrutura Atual

### YoutubeService Atual (Limitações)
```javascript
class YoutubeService {
    // ✅ FUNCIONALIDADES EXISTENTES
    async searchVideos(searchQuery, channelId)     // ✅ Busca vídeos
    async getVideoDetails(videoId)              // ✅ Detalhes de vídeo
    
    // ❌ FUNCIONALIDADES AUSENTES
    // uploadVideo()          // ❌ Não existe
    // scheduleVideo()        // ❌ Não existe
    // publishVideo()         // ❌ Não existe
    // getUploadStatus()      // ❌ Não existe
}
```

### Problemas Identificados
1. **Apenas leitura**: Service atual só busca informações
2. **Sem upload**: Não envia vídeos para YouTube
3. **Sem agendamento**: Não programa publicações
4. **Sem status**: Não acompanha processo de upload
5. **Sem integração**: Não conectado com VideoService

## 🏗️ Arquitetura Proposta

### Fase 1: Extensão do YoutubeService

#### 1.1 Adicionar Funcionalidades de Upload
```javascript
// src/modules/youtube/services/youtube.service.js
class YoutubeService {
    constructor(channelContext) {
        this.channelContext = channelContext;
        this.apiKey = channelContext.getApiKey('youtube');
        this.channelId = channelContext.apis.youtube.channelId;
        this.uploadProgress = new Map(); // Track uploads por vídeo
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
                auth: this.apiKey
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
                auth: this.apiKey
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
                auth: this.apiKey
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
```

### Fase 2: YouTubePublisherService (Classe Intermediária)

#### 2.1 Criar Service de Publicação
```javascript
// src/modules/youtube/services/youtube-publisher.service.js
class YouTubePublisherService {
    constructor(youtubeService, videoService, channelContext) {
        this.youtubeService = youtubeService;
        this.videoService = videoService;
        this.channelContext = channelContext;
        this.publicationQueue = [];
        this.scheduledVideos = new Map();
    }
    
    /**
     * Fluxo completo: Criar vídeo → Upload → Agendar
     * @param {Object} postData - Dados do post
     * @param {Date} publishAt - Data/horário de publicação
     * @returns {Promise<Object>} Resultado completo
     */
    async processVideoPublication(postData, publishAt = null) {
        try {
            Logger.info(`Iniciando processo de publicação: ${postData.titleVideo}`);
            
            // 1. Criar vídeo localmente
            const videoPath = await this.createLocalVideo(postData);
            Logger.info(`Vídeo criado localmente: ${videoPath}`);
            
            // 2. Fazer upload para YouTube
            const uploadResult = await this.uploadToYouTube(videoPath, postData);
            Logger.info(`Vídeo uploadado: ${uploadResult.videoId}`);
            
            // 3. Agendar ou publicar
            const publishResult = publishAt 
                ? await this.scheduleVideo(uploadResult.videoId, publishAt)
                : await this.publishVideo(uploadResult.videoId);
            
            // 4. Limpar arquivo temporário
            await this.cleanupTempFile(videoPath);
            
            // 5. Salvar no banco local
            await this.savePublicationRecord({
                ...postData,
                videoId: uploadResult.videoId,
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
     * Cria vídeo localmente usando VideoService existente
     * @param {Object} postData - Dados do post
     * @returns {Promise<string>} Caminho do vídeo criado
     */
    async createLocalVideo(postData) {
        const outputDir = `${DIR_TO_POST}/${this.channelContext.name}`;
        const videoFileName = `video_${Date.now()}.mp4`;
        const videoPath = path.join(outputDir, videoFileName);
        
        // Garantir que diretório existe
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Usar VideoService existente para criar vídeo
        const result = await this.videoService.createVideo(postData, videoPath);
        
        if (!result) {
            throw new Error('Falha ao criar vídeo localmente');
        }
        
        return videoPath;
    }
    
    /**
     * Faz upload para YouTube
     * @param {string} videoPath - Caminho do vídeo
     * @param {Object} postData - Metadados
     * @returns {Promise<Object>} Resultado do upload
     */
    async uploadToYouTube(videoPath, postData) {
        const metadata = {
            title: postData.titleVideo,
            description: postData.youtubeDescription || this.generateDescription(postData),
            tags: postData.hashtags || [],
            categoryId: '22', // Entertainment
            privacy: 'private' // Private inicialmente
        };
        
        return await this.youtubeService.uploadVideo(videoPath, metadata);
    }
    
    /**
     * Agenda publicação
     * @param {string} videoId - ID do vídeo
     * @param {Date} publishAt - Data de publicação
     * @returns {Promise<Object>} Resultado
     */
    async scheduleVideo(videoId, publishAt) {
        return await this.youtubeService.scheduleVideo(videoId, publishAt);
    }
    
    /**
     * Publica imediatamente
     * @param {string} videoId - ID do vídeo
     * @returns {Promise<Object>} Resultado
     */
    async publishVideo(videoId) {
        return await this.youtubeService.publishVideo(videoId);
    }
    
    /**
     * Gera descrição usando TextFormatter
     * @param {Object} postData - Dados do post
     * @returns {string} Descrição formatada
     */
    generateDescription(postData) {
        const { titlePost, hashtags, ads } = postData;
        const linkProducts = this.generateProductLinks(ads);
        
        return TextFormatter.formatSocialMediaDescription(
            titlePost,
            linkProducts,
            StringUtils.join(hashtags, ' '),
            'youtube',
            this.channelContext
        ).description;
    }
    
    /**
     * Gera links dos produtos
     * @param {Array} ads - Array de anúncios
     * @returns {string} URL dos produtos
     */
    generateProductLinks(ads) {
        const codes = ArrayUtils.map(ads, ad => ad.code);
        return this.videoService.linkBaseSearchProducts(codes);
    }
    
    /**
     * Limpa arquivo temporário
     * @param {string} videoPath - Caminho do arquivo
     */
    async cleanupTempFile(videoPath) {
        try {
            if (fs.existsSync(videoPath)) {
                await fs.promises.unlink(videoPath);
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
        // Implementar persistência (arquivo JSON, banco de dados, etc.)
        const recordsFile = path.join(DIR_TEMP, 'youtube-publications.json');
        
        let records = [];
        if (fs.existsSync(recordsFile)) {
            const content = fs.readFileSync(recordsFile, 'utf8');
            records = JSON.parse(content);
        }
        
        records.push(record);
        fs.writeFileSync(recordsFile, JSON.stringify(records, null, 2));
        
        Logger.info(`Registro salvo: ${record.videoId}`);
    }
    
    /**
     * Obtém publicações agendadas
     * @returns {Array} Lista de vídeos agendados
     */
    getScheduledVideos() {
        const recordsFile = path.join(DIR_TEMP, 'youtube-publications.json');
        
        if (!fs.existsSync(recordsFile)) return [];
        
        const content = fs.readFileSync(recordsFile, 'utf8');
        const records = JSON.parse(content);
        
        return records.filter(record => 
            record.status === 'scheduled' && 
            new Date(record.publishAt) > new Date()
        );
    }
    
    /**
     * Processa publicações agendadas
     */
    async processScheduledPublications() {
        const scheduled = this.getScheduledVideos();
        
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
}
```

### Fase 3: Integração com AdController

#### 3.1 Modificar AdController
```javascript
// src/modules/ads/controllers/ad.controller.js
class Ad {
    constructor(channelId = process.env.ACTIVE_CHANNEL || 'wedconecta') {
        const channelConfig = CHANNELS_CONFIG[channelId];
        this.channelContext = new ChannelContext(channelConfig);
        
        // Services existentes
        this.magazineLuizaService = new MagazineLuizaService(this.channelContext);
        this.videoService = new VideoService(this.channelContext);
        
        // Novo serviço de publicação
        this.youtubeService = new YoutubeService(this.channelContext);
        this.youtubePublisher = new YouTubePublisherService(
            this.youtubeService,
            this.videoService,
            this.channelContext
        );
        
        // ... resto do constructor
    }
    
    /**
     * Cria vídeo e publica no YouTube
     * @param {Object} postDay - Dados do post
     * @param {Date} publishAt - Data de publicação (opcional)
     * @returns {Promise<Object>} Resultado
     */
    async createAndPublishVideo(postDay, publishAt = null) {
        try {
            Logger.info(`Iniciando criação e publicação de vídeo`);
            
            // 1. Usar fluxo existente para criar conteúdo
            const posts = await this.step2FilesForTitleAndComments(postDay);
            
            // 2. Processar cada post
            const results = [];
            for (const postData of posts) {
                const result = await this.youtubePublisher.processVideoPublication(
                    postData,
                    publishAt
                );
                results.push(result);
                
                Logger.success(`Vídeo processado: ${postData.titleVideo}`);
            }
            
            return {
                success: true,
                processed: results.length,
                results: results
            };
            
        } catch (error) {
            Logger.error('Erro ao criar e publicar vídeo', error);
            throw error;
        }
    }
    
    /**
     * Agenda vídeos para datas específicas
     * @param {Array} posts - Array de posts
     * @param {Date} baseDate - Data base para agendamento
     */
    async scheduleVideos(posts, baseDate = null) {
        const results = [];
        let currentDate = baseDate || new Date();
        
        for (let i = 0; i < posts.length; i++) {
            // Calcular data de publicação (ex: um por dia às 18:30)
            const publishDate = new Date(currentDate);
            publishDate.setHours(18, 30, 0, 0);
            publishDate.setDate(publishDate.getDate() + i);
            
            const result = await this.createAndPublishVideo(posts[i], publishDate);
            results.push(result);
            
            Logger.info(`Vídeo agendado: ${posts[i].titleVideo} para ${publishDate.toLocaleString('pt-BR')}`);
        }
        
        return results;
    }
    
    /**
     * Processa publicações agendadas automaticamente
     */
    async processScheduledPublications() {
        return await this.youtubePublisher.processScheduledPublications();
    }
}
```

### Fase 4: Configurações e Environment

#### 4.1 Atualizar Configurações
```javascript
// src/config/channels.config.js
const CHANNELS_CONFIG = {
    wedconecta: {
        // ... configurações existentes
        apis: {
            youtube: {
                apiKey: process.env.WEDCONECTA_YOUTUBE_API_KEY,
                channelId: 'UCEsHJAZezJSuOUEqLJ3t2dg',
                uploadEnabled: true,
                maxVideoSize: '2GB', // Limite do YouTube
                allowedFormats: ['mp4', 'mov', 'avi']
            }
        },
        publication: {
            defaultPrivacy: 'private',
            defaultCategory: '22', // Entertainment
            defaultLanguage: 'pt',
            autoPublish: false, // Requer agendamento manual
            scheduleTimes: ['18:30'], // Horários padrão
            maxDailyPosts: 3
        }
    }
};
```

## 📅 Cronograma de Implementação

### Semana 1: Fundação (8-10 horas)
- [ ] Implementar métodos de upload em YoutubeService
- [ ] Criar YouTubePublisherService
- [ ] Configurar environment variables
- [ ] Testar upload básico

### Semana 2: Agendamento (6-8 horas)
- [ ] Implementar scheduleVideo() em YoutubeService
- [ ] Criar sistema de fila de publicação
- [ ] Implementar processamento automático
- [ ] Testar agendamento

### Semana 3: Integração (4-6 horas)
- [ ] Integrar YouTubePublisher com AdController
- [ ] Modificar fluxo atual de criação
- [ ] Implementar publicação em lote
- [ ] Testar integração completa

### Semana 4: Persistência (4-5 horas)
- [ ] Implementar salvamento de registros
- [ ] Criar sistema de recuperação
- [ ] Adicionar tratamento de erros
- [ ] Testar persistência

### Semana 5: Testes e Deploy (6-8 horas)
- [ ] Testes integrados completos
- [ ] Testes de carga e performance
- [ ] Documentação completa
- [ ] Deploy e validação

## 🧪 Testes Necessários

### 1. Testes de Upload
```javascript
describe('YoutubeService Upload', () => {
    test('deve fazer upload de vídeo com sucesso', async () => {
        const result = await youtubeService.uploadVideo(testVideoPath, testMetadata);
        expect(result.success).toBe(true);
        expect(result.videoId).toBeDefined();
    });
    
    test('deve falhar com arquivo inexistente', async () => {
        await expect(youtubeService.uploadVideo('invalid.mp4', {}))
            .rejects.toThrow('Arquivo de vídeo não encontrado');
    });
});
```

### 2. Testes de Agendamento
```javascript
describe('YouTubePublisherService', () => {
    test('deve agendar publicação futura', async () => {
        const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const result = await publisher.scheduleVideo(videoId, futureDate);
        expect(result.status).toBe('scheduled');
    });
    
    test('deve processar publicações agendadas', async () => {
        await publisher.processScheduledPublications();
        // Validar se vídeos foram publicados
    });
});
```

### 3. Testes de Integração
```javascript
describe('AdController Integration', () => {
    test('deve criar e publicar vídeo completo', async () => {
        const result = await adController.createAndPublishVideo(testPost);
        expect(result.success).toBe(true);
        expect(result.processed).toBe(1);
    });
});
```

## 📋 Checklist de Implementação

### Pré-Implementação
- [ ] Backup do código atual
- [ ] Configurar YouTube Data API v3
- [ ] Setup de OAuth 2.0 para uploads
- [ ] Criar estrutura de diretórios

### Implementação
- [ ] Extender YoutubeService com upload/schedule
- [ ] Criar YouTubePublisherService
- [ ] Integrar com AdController existente
- [ ] Implementar persistência de registros
- [ ] Adicionar tratamento de erros robusto

### Pós-Implementação
- [ ] Testes completos
- [ ] Documentação atualizada
- [ ] Monitoramento implementado
- [ ] Backup e recovery

## 🚀 Benefícios Esperados

### 1. **Automação Completa**
- Criação → Upload → Agendamento automáticos
- Redução de trabalho manual
- Publicações consistentes

### 2. **Gestão de Conteúdo**
- Agendamento antecipado
- Controle de status em tempo real
- Histórico completo

### 3. **Escalabilidade**
- Suporte a múltiplos canais
- Publicação em lote
- Processamento automático

## 📊 Métricas de Sucesso

- **Tempo de implementação**: 28-37 horas
- **Upload**: <5 minutos por vídeo
- **Agendamento**: Suporte para 100+ vídeos
- **Taxa de sucesso**: >95%
- **Recuperação**: <1 minuto para falhas

## 🎯 Conclusão

Esta implementação criará um fluxo completo de publicação no YouTube, integrando-se perfeitamente com a arquitetura existente e permitindo automação total do processo: criação → upload → agendamento → publicação.

**Status**: ✅ **Pronto para implementação**
