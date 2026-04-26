const { randomUUID } = require('crypto');
const MagazineLuizaService = require('../services/magazine-luiza.service');
const RestService = require('../../storage/services/rest.service');
const { join } = require('path');
const adJson = require('../ad.json');
const { DIR_TO_POST, DIR_TEMP, DIR_VIDEOS, FILE_FOR_CREATE, DIR_TO_CREATE } = require('../../../config/directory.config');
const VideoQueue = require('../../videos/services/video-queue.service');
const ENDPOINTS = require('../../../config/url.config');
const VideoService = require('../../videos/services/video.service');
const YoutubeService = require('../../youtube/services/youtube.service');
const YouTubePublisherService = require('../../youtube/services/youtube-publisher.service');
const File = require('../../storage/services/file.service');
const { Logger, ValidationUtils, StringUtils, HashtagUtils, ArrayUtils, DateUtils, TextFormatter, FileUtils } = require('../../../shared/utils');

class Ad {
    magazineLuizaService = null;
    videoService = null;
    numberAdByPost = 3;
    hours = [
        '18:30'
    ];
    numberPostsByDay = this.hours.length;
    anuncios = adJson;

    constructor(
        restService = new RestService(),
        magazineLuizaService = new MagazineLuizaService(restService),
        videoService = new VideoService(restService),
        youtubeService = new YoutubeService(restService)
    ) {
        this.restService = restService;
        this.magazineLuizaService = magazineLuizaService;
        this.videoService = videoService;
        this.youtubeService = youtubeService;

        // Inicializar YouTubePublisherService
        this.youtubePublisher = new YouTubePublisherService(
            this.youtubeService,
            this.videoService,
            { name: 'wedconecta' }
        );
    }

    linkBaseSearchProducts = (codes) => `${ENDPOINTS.wedConecta.search}/${StringUtils.join(codes, '+')}/`;

    async updateVideosName(videoNumber, videoName, videosFiltered) {
            ArrayUtils.forEach(videosFiltered, item => {
            if (item === `${videoNumber}.mp4`) {
                FileUtils.rename(`${DIR_VIDEOS}/${videoNumber}.mp4`, `${DIR_VIDEOS}/${videoName}.mp4`);
            }
        });
    }

    separateCodeTitleAdTitlePostAndHashtag(contentArray) {
        return ArrayUtils.filter(
            ArrayUtils.map(contentArray, item => {
                const itemSplited = StringUtils.splitBySeparator(item, ';');
                if (itemSplited.length === 4) {
                    const codes = ValidationUtils.validateThreeCodesForCreate(itemSplited[0], this.numberAdByPost) ? itemSplited[0] : null;
                    if (codes) {
                        return {
                            codes: itemSplited[0],
                            titleVideo: itemSplited[1],
                            titlePost: itemSplited[2],
                            hashtag: itemSplited[3],
                            products: []
                        }
                    }
                }
                return false;
            }),
            item => item !== false
        );
    }

    downloadImg(linkImg, filePath) {
        return this.restService.downloadImage(linkImg, filePath);
    }

    async step1FilesForCreateVideos(dateFirstPost) {
        let tempContents = [];
        const contentsForCreatePosts = [];
        const codeInvalid = [];
        let { year, month, day } = dateFirstPost;
        let datePost = DateUtils.getDate(year, month, day);
        const contentFileSplited = await FileUtils.txtForArrayString(FILE_FOR_CREATE);
        const contents = this.separateCodeTitleAdTitlePostAndHashtag(contentFileSplited);
        for (const content of contents) {
            const { codes, titleAd, titlePost, hashtag } = content;
            const codesFormated = StringUtils.formatCodesRemoveSlash(codes);
            Logger.info('Buscando códigos:', codesFormated);
            const codesIsValid = await this.magazineLuizaService.verifyCodes(codesFormated, this.numberAdByPost);
            Logger.info(`Códigos válidos: ${codesIsValid}`);
            if (codesIsValid) {
                tempContents.push(content);
                if (tempContents.length === this.numberPostsByDay) {
                    contentsForCreatePosts.push({
                        date: DateUtils.getDateFormated(datePost),
                        contents: tempContents
                    });
                    tempContents = [];
                    datePost = DateUtils.getDatePlusDay(datePost, 1);
                }
            } else {
                codeInvalid.push(content);
            }
        }

        if (contentsForCreatePosts.length > 0) {
            const dirExists = FileUtils.existsSync(DIR_TO_CREATE);
            if (!dirExists) await FileUtils.mkdir(DIR_TO_CREATE);
            for (const postsDay of contentsForCreatePosts) {
                const { date } = postsDay;
                const dateSplit = StringUtils.splitBySeparator(date, '-');
                const day = Number(dateSplit[2]);
                const month = Number(dateSplit[1]);
                const year = Number(dateSplit[0]);

                const datePost = DateUtils.getDateFormated(DateUtils.getDate(year, month, day));
                const pathDateTitle = join(DIR_TO_CREATE, datePost);
                const dirDateExists = FileUtils.existsSync(pathDateTitle);
                if (!dirDateExists) await FileUtils.mkdir(pathDateTitle);

                const postDay = {
                    date: { day, month, year },
                    posts: []
                }

                let print = `Posts do dia ${day.length > 1 ? day : `0${day}`}-${month.length > 1 ? month : `0${month}`}-${year}\n\n`;
                let countPost = 1
                for (const post of postsDay.contents) {
                    print += `POST ${countPost} as ${this.hours[countPost - 1]}\n\n`;

                    const { codes, titleVideo, titlePost, hashtag } = post;
                    const allProducts = await this.magazineLuizaService.getProductsByCodesFormated(post.codes, this.numberAdByPost);
                    let countProduct = 1
                    for (const product of allProducts) {
                        const linkImg = product.imgLink;
                        const ext = StringUtils.getExtension(linkImg);
                        const imgName = `img-for-create-video-post-${countPost}-image-${countProduct}-${product.code}`;
                        const pathImg = join(pathDateTitle, `${imgName}.${ext}`);
                        product['imgPath'] = pathImg;
                        await this.downloadImg(linkImg, pathImg);
                        print += `${product.title}\n${product.price}\n${product.code}\n${pathImg}\n${product.link}\n\n`;
                        countProduct++;
                    }

                    postDay.posts.push({
                        titlePost,
                        titleVideo,
                        hashtags: HashtagUtils.normalizeHashtags(StringUtils.splitBySeparator(hashtag, ' ')),
                        ads: allProducts
                    });
                    countPost++;
                }

                const pathJsonAd = join(pathDateTitle, `for-create-post-Ad.json`);
                await FileUtils.writeFile(pathJsonAd, JSON.stringify(postDay));
                const pathTxtForCreateVideo = join(pathDateTitle, `for-create-videos.txt`);
                await FileUtils.writeFile(pathTxtForCreateVideo, print);

                await this.createVideos(postDay);
                await this.step2FilesForTitleAndComments(postDay);
            }
        }

        if (tempContents.length > 0) {
            Logger.warn('Códigos não atingiram a quantidade necessária', tempContents);
        }

        if (codeInvalid.length > 0) {
            Logger.warn('Códigos inválidos', codeInvalid);
        }
    }

    async createVideos(postDay) {
        const dirExists = FileUtils.existsSync(DIR_TO_POST);
        if (!dirExists) await FileUtils.mkdir(DIR_TO_POST);
        const { date: { year, month, day } } = postDay;
        const datePost = DateUtils.getDateFormated(DateUtils.getDate(year, month, day));
        const pathDateTitle = join(DIR_TO_POST, datePost);
        const dirDateExists = FileUtils.existsSync(pathDateTitle);
        if (!dirDateExists) await FileUtils.mkdir(pathDateTitle);

        Logger.section(`Criação de Vídeos - Processando ${postDay.posts.length} vídeos para ${datePost}`);

        const queue = new VideoQueue(this.videoService, 1);

        let count = 1;
        for (const post of postDay.posts) {
            const { titlePost, titleVideo } = post;
            const fileVideoName = `${count}_${titlePost}_${randomUUID()}.mp4`;
            const pathPostVideo = join(pathDateTitle, fileVideoName);

            queue.addTask(post, pathPostVideo, {
                maxRetries: 3,
                onProgress: (event) => {
                    if (event.status === 'completed') {
                        Logger.success(`${titleVideo} foi criado com sucesso!`);
                    }
                },
                onError: (event) => {
                    if (event.status === 'failed') {
                        Logger.error(`${titleVideo} não pôde ser criado após ${event.attempt} tentativas`, event.error);
                    }
                }
            });

            count++;
        }

        const result = await queue.process();

        Logger.section('Resumo da Criação de Vídeos');
        if (result.success) {
            Logger.success('Todos os vídeos foram criados com sucesso!');
        } else {
            Logger.warn(`${result.stats.failed} vídeo(s) falharam após retries automáticos`);
            Logger.info('Para reprocessar falhas, execute novamente o comando');
        }
        Logger.stats('Estatísticas', {
            'Sucesso': result.stats.completed,
            'Falhas': result.stats.failed,
            'Retries': result.stats.retried,
            'Tempo total': result.stats.duration
        });

        return result;
    }

    async step2FilesForTitleAndComments(postDay) {
        const dirExists = FileUtils.existsSync(DIR_TO_POST);
        if (!dirExists) await FileUtils.mkdir(DIR_TO_POST);
        let count = 1;

        for (const anuncio of postDay.posts) {
            const codes = ArrayUtils.map(anuncio.ads, ad => ad.code);
            const linkProducts = this.linkBaseSearchProducts(codes);

            const { date: { year, month, day } } = postDay;
            const { titlePost, hashtags } = anuncio;
            const youtube = TextFormatter.formatYoutubeDescription(titlePost, linkProducts, StringUtils.join(hashtags, ' '));
            const tiktok = TextFormatter.formatTiktokDescription(titlePost, StringUtils.join(hashtags, ' '));
            const meta = TextFormatter.formatInstagramDescription(titlePost, '', StringUtils.join(hashtags, ' '));
            const datePost = DateUtils.getDateFormated(DateUtils.getDate(year, month, day));

            const pathDateTitle = join(DIR_TO_POST, datePost);
            const dirDateExists = FileUtils.existsSync(pathDateTitle);
            if (!dirDateExists) await FileUtils.mkdir(pathDateTitle);

            const content = [`Postar as ${this.hours[count - 1]}\n\n`];
            content.push(`${datePost} ${titlePost}\n`);
            content.push(`${linkProducts}\n\n`);
            content.push('******************************************** YOUTUBE\n\n');
            content.push(youtube.title);
            content.push(youtube.description);
            content.push('\n\n');
            content.push('******************************************** META REELS\n\n');
            content.push(meta);
            content.push('\n\n');
            content.push('******************************************** TIKTOK\n\n');
            content.push(tiktok);

            const fileName = `${count}_${titlePost}_${randomUUID()}.txt`;
            await FileUtils.writeFile(join(pathDateTitle, fileName), StringUtils.join(content, ''));
            count++;
        }
    }

    /**
     * Publica vídeos existentes no YouTube
     * @param {Object} postDay - Dados do post com vídeos já criados
     * @param {Date} publishAt - Data de publicação (opcional)
     * @returns {Promise<Object>} Resultado
     */
    async publishExistingVideos(postDay, publishAt = null) {
        try {
            Logger.info(`Iniciando publicação de vídeos existentes no YouTube`);

            // 1. Gerar conteúdo para os vídeos já criados
            await this.step2FilesForTitleAndComments(postDay);

            // 2. Processar cada post (vídeos já existem)
            const results = [];
            for (const postData of postDay.posts) {
                const videoPath = await this.findCreatedVideoPath(postData, postDay);

                if (videoPath) {
                    const result = await this.youtubePublisher.publishExistingVideo(
                        postData,
                        videoPath,
                        publishAt
                    );
                    results.push(result);
                    Logger.success(`Vídeo publicado: ${postData.titleVideo}`);
                } else {
                    Logger.warn(`Vídeo não encontrado para: ${postData.titleVideo}`);
                    results.push({
                        success: false,
                        error: 'Vídeo não encontrado localmente',
                        titleVideo: postData.titleVideo
                    });
                }
            }

            return {
                success: true,
                processed: results.length,
                results: results
            };

        } catch (error) {
            Logger.error('Erro ao publicar vídeos existentes', error);
            throw error;
        }
    }

    async findCreatedVideoPath(postData, postDay) {
        try {
            const { date: { year, month, day } } = postDay;
            const datePost = DateUtils.getDateFormated(DateUtils.getDate(year, month, day));
            const pathDateTitle = join(DIR_TO_POST, datePost);

            Logger.info(`Buscando vídeos em: ${pathDateTitle}`);
            Logger.info(`Título do vídeo: ${postData.titleVideo}`);

            const files = await File.readdir(pathDateTitle);
            const videoFiles = files.filter(file => file.endsWith('.mp4'));

            Logger.info(`Arquivos MP4 encontrados: ${videoFiles.length}`);
            Logger.info(`Arquivos: ${videoFiles.join(', ')}`);

            // Busca mais flexível - remove caracteres especiais e busca por partes
            const titleClean = postData.titleVideo.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            
            for (const file of videoFiles) {
                const filePath = join(pathDateTitle, file);
                const stats = await File.stat(filePath);
                const fileClean = file.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

                Logger.info(`Comparando: "${fileClean}" com "${titleClean}"`);

                if (stats.isFile() && (fileClean.includes(titleClean) || titleClean.includes(fileClean.substring(0, 10)))) {
                    Logger.success(`Vídeo encontrado: ${filePath}`);
                    return filePath;
                }
            }

            Logger.warn(`Nenhum vídeo encontrado para: ${postData.titleVideo}`);
            return null;
        } catch (error) {
            Logger.error('Erro ao encontrar vídeo criado', error);
            return null;
        }
    }

    /**
     * Agenda vídeos para datas específicas baseado na data do post
     * @param {Object} postDay - Dados do post com data original
     * @returns {Promise<Object>} Resultado do agendamento
     */
    async scheduleVideosFromPostDay(postDay) {
        try {
            Logger.info(`Agendando vídeos para data base: ${postDay.date.day}/${postDay.date.month}/${postDay.date.year}`);
            
            // Usa a data do post como base (ex: 27/04/2026)
            const baseDate = new Date(postDay.date.year, postDay.date.month - 1, postDay.date.day);
            
            // Agenda cada vídeo para dias consecutivos
            const results = [];
            for (let i = 0; i < postDay.posts.length; i++) {
                const publishDate = new Date(baseDate);
                publishDate.setHours(18, 30, 0, 0);
                publishDate.setDate(publishDate.getDate() + i); // +1 dia a partir da data do post
                
                // Criar postDay individual com o post específico
                const individualPostDay = {
                    date: postDay.date,
                    posts: [postDay.posts[i]] // Array com apenas este post
                };
                
                const result = await this.publishExistingVideos(individualPostDay, publishDate);
                results.push(result);
                
                Logger.info(`Vídeo agendado: ${postDay.posts[i].titleVideo} para ${publishDate.toLocaleString('pt-BR')}`);
            }
            
            return {
                success: true,
                scheduled: results.length,
                results: results,
                baseDate: baseDate.toLocaleDateString('pt-BR')
            };
            
        } catch (error) {
            Logger.error('Erro ao agendar vídeos a partir do postDay', error);
            throw error;
        }
    }
}

module.exports = Ad;