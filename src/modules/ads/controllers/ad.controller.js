const { randomUUID } = require('crypto');
const MagazineLuizaService = require('../services/magazine-luiza.service');
const RestService = require('../../storage/services/rest.service');
const File = require('../../storage/services/file.service');
const { join } = require('path');
const adJson = require('../ad.json');
const { DIR_TO_POST, DIR_TEMP, DIR_VIDEOS, FILE_FOR_CREATE, DIR_TO_CREATE } = require('../../../config/directory.config');
const VideoQueue = require('../../videos/services/video-queue.service');
const ENDPOINTS = require('../../../config/url.config');
const VideoService = require('../../videos/services/video.service');
const { Logger, ValidationUtils, StringUtils, HashtagUtils, ArrayUtils, DateUtils, TextFormatter } = require('../../../shared/utils');

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
        videoService = new VideoService(restService)
    ) {
        this.restService = restService;
        this.magazineLuizaService = magazineLuizaService;
        this.videoService = videoService;
    }

    // BACKUP ORIGINAL: Métodos de data
    getDatePlusDay(date, days) {
        date.setDate(date.getDate() + days);
        return this.getDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
    }

    getDate(year, month, day) {
        return new Date(year, month - 1, day);
    }

    getDateFormated(date) {
        const datePost = date;
        const monthformated = datePost.getMonth() >= 9 ? datePost.getMonth() + 1 : `0${datePost.getMonth() + 1}`;
        return `${datePost.getFullYear()}-${monthformated}-${datePost.getDate()}`;
    }

    linkBaseSearchProducts = (codes) => `${ENDPOINTS.wedConecta.search}/${StringUtils.join(codes, '+')}/`;

    async updateVideosName(videoNumber, videoName, videosFiltered) {
        // BACKUP ORIGINAL: videosFiltered.forEach
        ArrayUtils.forEach(videosFiltered, item => {
            if (item === `${videoNumber}.mp4`) {
                File.rename(`${DIR_VIDEOS}/${videoNumber}.mp4`, `${DIR_VIDEOS}/${videoName}.mp4`);
            }
        });
    }

    separateCodeTitleAdTitlePostAndHashtag(contentArray) {
        return ArrayUtils.filter(
            ArrayUtils.map(contentArray, item => {
                const itemSplited = StringUtils.splitBySeparator(item, ';');
                if (itemSplited.length === 4) {
                    const codes = this.validateThreeCodesForCreate(itemSplited[0]);
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

    validateThreeCodesForCreate(codesString) {
        return ValidationUtils.validateThreeCodesForCreate(codesString, this.numberAdByPost);
    }

    getExtension(linkImg) {
        return StringUtils.getExtension(linkImg);
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
        const contentFileSplited = await File.txtForArrayString(FILE_FOR_CREATE);
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
            const dirExists = File.existsSync(DIR_TO_CREATE);
            if (!dirExists) await File.mkdir(DIR_TO_CREATE);
            for (const postsDay of contentsForCreatePosts) {
                const { date } = postsDay;
                const dateSplit = StringUtils.splitBySeparator(date, '-');
                const day = Number(dateSplit[2]);
                const month = Number(dateSplit[1]);
                const year = Number(dateSplit[0]);

                const datePost = DateUtils.getDateFormated(DateUtils.getDate(year, month, day));
                const pathDateTitle = join(DIR_TO_CREATE, datePost);
                const dirDateExists = File.existsSync(pathDateTitle);
                if (!dirDateExists) await File.mkdir(pathDateTitle);

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
                        const ext = this.getExtension(linkImg);
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
                await File.writeFile(pathJsonAd, JSON.stringify(postDay));
                const pathTxtForCreateVideo = join(pathDateTitle, `for-create-videos.txt`);
                await File.writeFile(pathTxtForCreateVideo, print);

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
        const dirExists = File.existsSync(DIR_TO_POST);
        if (!dirExists) await File.mkdir(DIR_TO_POST);
        const { date: { year, month, day } } = postDay;
        const datePost = DateUtils.getDateFormated(DateUtils.getDate(year, month, day));
        const pathDateTitle = join(DIR_TO_POST, datePost);
        const dirDateExists = File.existsSync(pathDateTitle);
        if (!dirDateExists) await File.mkdir(pathDateTitle);

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
        const dirExists = File.existsSync(DIR_TO_POST);
        if (!dirExists) await File.mkdir(DIR_TO_POST);
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
            const dirDateExists = File.existsSync(pathDateTitle);
            if (!dirDateExists) await File.mkdir(pathDateTitle);

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
            await File.writeFile(join(pathDateTitle, fileName), StringUtils.join(content, ''));
            count++;
        }
    }

    // BACKUP ORIGINAL: Métodos de texto
    getTiktokDescription(titleComom, hashtags) {
        const title = `${titleComom} - Link na BIO #parceiromagalu #achadinhos #promo #promotion #sale ${StringUtils.join(hashtags, ' ')}`
        return title;
    }

    getYoutubeDescription(titleComom, linkProducts, hashtags) {
        const title = `${titleComom} #shorts da @wedconecta\n\n`;
        let description = `Link para os produtos: ${linkProducts}\n\n`;
        description += `Siga nossas redes sociais:\n`;
        description += `Instagram: https://www.instagram.com/wedconecta\n`;
        description += `Facebook: https://www.facebook.com/wedconecta\n`;
        description += `TikTok: https://www.tiktok.com/@wedconecta\n\n`;
        description += `#shorts da @wedconecta\n`;
        description += `#achadinhos #achados #parceiromagalu #wedconecta #promoção #promo #promotion #ofertas ${StringUtils.join(hashtags, ' ')}\n`;

        return { title, description };
    }

    getMetaDescription(titleComom, hashtags) {
        let description = `${titleComom}\nLink da loja na BIO\n\n`;
        description += `Siga nossas redes sociais:\n`;
        description += `YouTube: https://www.youtube.com/@wedconecta\n`;
        description += `TikTok: https://www.tiktok.com/@wedconecta\n`;
        description += `Instagram: https://www.instagram.com/wedconecta\n`;
        description += `Facebook: https://www.facebook.com/wedconecta\n\n`;

        description += `#achadinhos #achados #parceiromagalu #wedconecta #promoção #promo #promotion #ofertas ${StringUtils.join(hashtags, ' ')}`;

        return description;
    }
}

module.exports = Ad;