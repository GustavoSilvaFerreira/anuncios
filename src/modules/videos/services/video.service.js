const { DIR_TEMP, DIR_FONT, DIR_TO_POST, DIR_VIDEOS } = require("../../../config/directory.config");
const { Logger, StringUtils } = require('../../../shared/utils');

const { open, } = require('node:fs/promises');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const VideoLib = require('node-video-lib');
const pathToFfmpeg = require('ffmpeg-static');
const ffprobe = require('ffprobe-static');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(pathToFfmpeg);
ffmpeg.setFfprobePath(ffprobe.path);
const { spawn } = require('node:child_process');

class VideoService {
    filePath = `${DIR_TEMP}/testes/teste.mp4`;
    videosRandom = [];
    VIDEOS_CONFIG = {
        template_1: {
            timeByIndex: (index) => {
                return {
                    '1': '3.1,5.9',
                    '2': '6.1,8.9',
                    '3': '9.1,11.9',
                }[index];
            },
            fontFamily: {
                titleFirstEndPage: `${DIR_FONT.replace(/[\\]/g, '/')}/gagalin.otf`,
                ads: `${DIR_FONT.replace(/[\\]/g, '/')}/roboto.ttf`,
                price: `${DIR_FONT.replace(/[\\]/g, '/')}/roboto-black.ttf`,
            },
            fontSize: {
                titleFirstEndPage: 100,
                ads: {
                    title: 55,
                    subTitle: 45,
                    price: 110,
                    code: 50
                }
            },
            scaleImgs: 'w=iw*1.5:h=ih*1.5',
            overlayImgs: '(main_w-overlay_w)/2:750',
            templateColor: {
                purple: {
                    filePath: `${DIR_VIDEOS}/model_1_purple.mp4`,
                    fontColor: {
                        titleFirstEndPage: '#723F33',
                        adsTitle: '#ffffff',
                        price: '#FFDE59',
                        code: '#000000'
                    }
                },
                yellow: {
                    filePath: `${DIR_VIDEOS}/model_1_yellow.mp4`,
                    fontColor: {
                        titleFirstEndPage: '#723F33',
                        adsTitle: '#9141B2',
                        price: '#9141B2',
                        code: '#723F33'
                    }
                },
                orange: {
                    filePath: `${DIR_VIDEOS}/model_1_orange.mp4`,
                    fontColor: {
                        titleFirstEndPage: '#723F33',
                        adsTitle: '#ffffff',
                        price: '#ffffff',
                        code: '#723F33'
                    }
                },
                baby_blue: {
                    filePath: `${DIR_VIDEOS}/model_1_baby_blue.mp4`,
                    fontColor: {
                        titleFirstEndPage: '#723F33',
                        adsTitle: '#ffffff',
                        price: '#ffffff',
                        code: '#723F33'
                    }
                },
                green: {
                    filePath: `${DIR_VIDEOS}/model_1_green.mp4`,
                    fontColor: {
                        titleFirstEndPage: '#723F33',
                        adsTitle: '#ffffff',
                        price: '#ffffff',
                        code: '#723F33'
                    }
                }
            }
        }
    }

    constructor() {
        this.setVideosRandom();
    }

    async teste() {
        const posts = {
            "date": {
                "day": 5,
                "month": 4,
                "year": 2023
            },
            "posts": [
                {
                    "titlePost": "Seleção de chocolate",
                    "titleVideo": "Seleção de chocolate",
                    "hashtags": [
                        "#pascoa",
                        "#chocolate",
                        "#lacta",
                        "#nestle",
                        "#garoto"
                    ],
                    "ads": [
                        {
                            "title": "Kit Caixa de Bombom Lacta Favoritos 250,6g - 3 Unidades",
                            "code": "229871400",
                            "imgLink": "https://a-static.mlcdn.com.br/618x463/kit-caixa-de-bombom-lacta-favoritos-2506g-3-unidades/magazineluiza/229871400/e3309fa500a207892d75153966b43e6c.jpg",
                            "price": "R$ 25,49",
                            "link": "https://www.magazinevoce.com.br/magazinewedconecta/kit-caixa-de-bombom-lacta-favoritos-2506g-3-unidades/p/229871400/ME/BOBM/",
                            "imgPath": "C:\\Users\\guto7\\workspace\\anuncios\\temp\\toCreate\\2023-04-5\\img-for-create-video-post-1-image-1-229871400.jpg"
                        },
                        {
                            "title": "Kit Caixa de Bombom Garoto Garotices Sortidos - 250g 3 Unidades",
                            "code": "229871200",
                            "imgLink": "https://a-static.mlcdn.com.br/618x463/kit-caixa-de-bombom-garoto-garotices-sortidos-250g-3-unidades/magazineluiza/229871200/a45b384c4163d554331fa42daec881cb.jpg",
                            "price": "R$ 26,69",
                            "link": "https://www.magazinevoce.com.br/magazinewedconecta/kit-caixa-de-bombom-garoto-garotices-sortidos-250g-3-unidades/p/229871200/ME/BOBM/",
                            "imgPath": "C:\\Users\\guto7\\workspace\\anuncios\\temp\\toCreate\\2023-04-5\\img-for-create-video-post-1-image-2-229871200.jpg"
                        },
                        {
                            "title": "Kit Caixa de Bombom Nestlé Especialidades 251g - 3 Unidades",
                            "code": "229871100",
                            "imgLink": "https://a-static.mlcdn.com.br/618x463/kit-caixa-de-bombom-nestle-especialidades-251g-3-unidades/magazineluiza/229871100/39fbcd782f45e02f883d83fd1641b0bb.jpg",
                            "price": "R$ 29,69",
                            "link": "https://www.magazinevoce.com.br/magazinewedconecta/kit-caixa-de-bombom-nestle-especialidades-251g-3-unidades/p/229871100/ME/BOBM/",
                            "imgPath": "C:\\Users\\guto7\\workspace\\anuncios\\temp\\toCreate\\2023-04-5\\img-for-create-video-post-1-image-3-229871100.jpg"
                        }
                    ]
                },
                {
                    "titlePost": "Seleção de licor",
                    "titleVideo": "Seleção de licor",
                    "hashtags": [
                        "#licor"
                    ],
                    "ads": [
                        {
                            "title": "Licor Fino de Whisky e Canela FIRE ONE Garrafa 750ml",
                            "code": "ee7g0ke92g",
                            "imgLink": "https://a-static.mlcdn.com.br/618x463/licor-fino-de-whisky-e-canela-fire-one-garrafa-750ml/paodeacucar/1144163/09d86e51d239f318313a59c7575d086e.jpeg",
                            "price": "R$ 50,99",
                            "link": "https://www.magazinevoce.com.br/magazinewedconecta/licor-fino-de-whisky-e-canela-fire-one-garrafa-750ml/p/ee7g0ke92g/ME/LCOR/",
                            "imgPath": "C:\\Users\\guto7\\workspace\\anuncios\\temp\\toCreate\\2023-04-5\\img-for-create-video-post-4-image-1-ee7g0ke92g.jpeg"
                        },
                        {
                            "title": "licor fino de café - holy coffee company",
                            "code": "aa1e0f644d",
                            "imgLink": "https://a-static.mlcdn.com.br/618x463/licor-fino-de-cafe-holy-coffee-company/holycoffeeco/050/c3e3473fbaa3a5c0c181bdf03c70346e.jpeg",
                            "price": "R$ 39,90",
                            "link": "https://www.magazinevoce.com.br/magazinewedconecta/licor-fino-de-cafe-holy-coffee-company/p/aa1e0f644d/ME/LCOR/",
                            "imgPath": "C:\\Users\\guto7\\workspace\\anuncios\\temp\\toCreate\\2023-04-5\\img-for-create-video-post-4-image-2-aa1e0f644d.jpeg"
                        },
                        {
                            "title": "Seleção de :' `´~^; . Dell, so?° >à<áãâ *-+ !#$@ a%¨&* (teste) _-+=§ªº}{[()]} ",
                            "code": "fh5g3a2d29",
                            "imgLink": "https://a-static.mlcdn.com.br/618x463/licor-amaretto-dell-orso-700ml/starbebidas/15699250689/ffa8732d9f80b5e3385bd8d9fbcea87b.jpeg",
                            "price": "R$ 65,94",
                            "link": "https://www.magazinevoce.com.br/magazinewedconecta/licor-amaretto-dell-orso-700ml/p/fh5g3a2d29/ME/LCOR/",
                            "imgPath": "C:\\Users\\guto7\\workspace\\anuncios\\temp\\toCreate\\2023-04-5\\img-for-create-video-post-4-image-3-fh5g3a2d29.jpeg"
                        }
                    ]
                }
            ]
        }
        let count = 1;
        for (const post of posts.posts) {
            try {
                const result = await this.createVideo(post, `${DIR_TO_POST}/saida_${count}.mp4`);
                if (result) Logger.success(`Vídeo ${post.titleVideo} criado com sucesso!`);
            } catch (error) {
                Logger.error(`Erro ao criar o vídeo ${post.titleVideo}`, error);
            }
            count++;
        }
    }

    validateAdsCharacter(ads) {
        StringUtils.sanitizeAdsObject(ads);
    }

    async validateInputs(post, outputPath) {
        const errors = [];

        for (const ad of post.ads) {
            if (!fs.existsSync(ad.imgPath)) {
                errors.push(`Imagem não encontrada: ${ad.imgPath}`);
            }
        }

        if (this.videosRandom.length === 0) {
            this.setVideosRandom();
        }

        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            try {
                fs.mkdirSync(outputDir, { recursive: true });
            } catch (err) {
                errors.push(`Não foi possível criar diretório de saída: ${outputDir} - ${err.message}`);
            }
        }

        const diskSpace = this.getAvailableDiskSpace();
        if (diskSpace < 500 * 1024 * 1024) {
            errors.push(`Espaço em disco insuficiente: ${(diskSpace / 1024 / 1024).toFixed(0)}MB disponível (requer 500MB)`);
        }

        if (errors.length > 0) {
            throw new Error(`Validação falhou:\n${errors.join('\n')}`);
        }
    }

    getAvailableDiskSpace() {
        try {
            const tmpDir = os.tmpdir();
            const stats = fs.statfsSync(tmpDir);
            return stats.bavail * stats.bsize;
        } catch (err) {
            Logger.warn('Não foi possível verificar espaço em disco', err);
            return Infinity;
        }
    }

    withTimeout(promise, timeoutMs, label = 'operação') {
        return Promise.race([
            promise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error(`${label} expirou após ${timeoutMs / 1000}s`)), timeoutMs)
            )
        ]);
    }

    async cleanupTempFile(tempPath) {
        try {
            if (tempPath && fs.existsSync(tempPath)) {
                await fs.promises.unlink(tempPath);
                Logger.info(`Arquivo temporário removido: ${tempPath}`);
            }
        } catch (err) {
            Logger.warn(`Erro ao remover arquivo temporário`, err);
        }
    }

    setVideosRandom() {
        Object.keys(this.VIDEOS_CONFIG).forEach(template => {
            return Object.keys(this.VIDEOS_CONFIG[template].templateColor).forEach(templateColor => {
                this.videosRandom.push({
                    template,
                    templateColor
                });
            });
        });
    }

    getTemplateVideoSelected() {
        if (this.videosRandom.length === 0) {
            this.setVideosRandom();
        }

        const randomNumber = Math.floor(Math.random() * this.videosRandom.length);
        const keyVideoRandom = randomNumber > (this.videosRandom.length - 1) ? 0 : randomNumber;
        const videoTemplateSelected = this.videosRandom[keyVideoRandom];
        
        if (!videoTemplateSelected) {
            throw new Error('Nenhum template de vídeo disponível');
        }
        
        const template = this.VIDEOS_CONFIG[videoTemplateSelected.template];
        if (!template) {
            throw new Error(`Template ${videoTemplateSelected.template} não encontrado na configuração`);
        }
        
        const templateColorSelected = template.templateColor[videoTemplateSelected.templateColor];
        if (!templateColorSelected) {
            throw new Error(`Cor de template ${videoTemplateSelected.templateColor} não encontrada`);
        }
        
        this.videosRandom.splice(keyVideoRandom, 1);
        return { template, templateColorSelected };
    }

    async createVideo(post, pathVideoOut) {
        this.validateAdsCharacter(post.ads);
        if (this.videosRandom.length === 0) {
            this.setVideosRandom();
        }
        const { template, templateColorSelected } = this.getTemplateVideoSelected();

        const fontFamily = template.fontFamily;
        const fontSize = template.fontSize;
        const scaleImgs = template.scaleImgs;
        const overlayImgs = template.overlayImgs;
        const timeByIndex = template.timeByIndex;
        const filePath = templateColorSelected.filePath;
        const videoConfig = templateColorSelected;

        Logger.info('Iniciando criação de vídeo');

        if (fs.existsSync(`${DIR_TEMP}/testes/saida.mp4`)) await fs.rm(`${DIR_TEMP}/testes/saida.mp4`, () => { Logger.debug('Arquivo de teste removido'); });

        const titleSplit = post.titleVideo.split(' ');
        const titleFormated = [];
        switch (titleSplit.length) {
            case 1:
                titleFormated.push({
                    y: 2.15,
                    text: titleSplit[0]
                });
                break;
            case 2:
                titleFormated.push({
                    y: 2.3,
                    text: titleSplit[0]
                });
                titleFormated.push({
                    y: 2,
                    text: titleSplit[1]
                });
                break;
            case 3:
                titleFormated.push({
                    y: 2.6,
                    text: titleSplit[0]
                });
                titleFormated.push({
                    y: 2.15,
                    text: titleSplit[1]
                });
                titleFormated.push({
                    y: 1.85,
                    text: titleSplit[2]
                });
                break;
            case 4:
                titleFormated.push({
                    y: 2.6,
                    text: titleSplit[0]
                });
                titleFormated.push({
                    y: 2.15,
                    text: `${titleSplit[1]} ${titleSplit[2]}`
                });
                titleFormated.push({
                    y: 1.85,
                    text: titleSplit[3]
                });
                break;
            default:
                break;
        }


        const filterTitle = [];
        titleFormated.forEach(item => {
            filterTitle.push(`drawtext=text='${item.text}':x=(w-text_w)/2:y=(h-text_h)/${item.y}:fontfile=${fontFamily.titleFirstEndPage}:fontsize=${fontSize.titleFirstEndPage}:fontcolor=${videoConfig.fontColor.titleFirstEndPage}:enable='between(t,0,2.9)'`);
        });

        const inputImgs = [];
        const filtersAds = [];

        const titleAdsLimitLength = 99;
        const setTitleFormated = (titleFormated, index, text) => {
            if (index <= 3) {
                if (!titleFormated[index]) titleFormated[index] = '';
                if ((titleFormated[index].length + text.length) <= (titleAdsLimitLength / 3)) {
                    const space = titleFormated[index] !== '' ? ' ' : '';
                    titleFormated[index] += `${space}${text}`;
                } else {
                    index++;
                    return setTitleFormated(titleFormated, index, text);
                }
            }
            return index;
        }

        post.ads.forEach((ad, index) => {
            const time = timeByIndex(index + 1);
            if (time) {
                inputImgs.push('-i');
                inputImgs.push(ad.imgPath);

                const titleSplit = ad.title.split(' ');
                let indexTitle = 1;
                let titleAds = {};

                titleSplit.forEach(titleSplited => {
                    indexTitle = setTitleFormated(titleAds, indexTitle, titleSplited);
                });
                const titleAdsFormated = [];
                switch (Object.keys(titleAds).length) {
                    case 1:
                        titleAdsFormated.push({
                            y: 150,
                            text: titleAds['1']
                        });
                        break;
                    case 2:
                        titleAdsFormated.push({
                            y: 140,
                            text: titleAds['1']
                        });
                        titleAdsFormated.push({
                            y: 200,
                            text: titleAds['2']
                        });
                        break;
                    case 3:
                        titleAdsFormated.push({
                            y: 90,
                            text: titleAds['1']
                        });
                        titleAdsFormated.push({
                            y: 150,
                            text: titleAds['2']
                        });
                        titleAdsFormated.push({
                            y: 210,
                            text: titleAds['3']
                        });
                        break;

                    default:
                        break;
                }
                titleAdsFormated.forEach(item => {
                    filtersAds.push(`drawtext=text='${item.text}':x=(w-text_w)/2:y=${item.y}:fontfile=${fontFamily.ads}:fontsize=${fontSize.ads.title}:fontcolor=${videoConfig.fontColor.adsTitle}:enable='between(t,${time})'`);
                });
                filtersAds.push(`drawtext=text='À VISTA':x=(w-text_w)/2:y=300:fontfile=${fontFamily.ads}:fontsize=${fontSize.ads.subTitle}:fontcolor=${videoConfig.fontColor.price}:enable='between(t,${time})'`);
                filtersAds.push(`drawtext=text='${ad.price}':x=(w-text_w)/2:y=350:fontfile=${fontFamily.price}:fontsize=${fontSize.ads.price}:fontcolor=${videoConfig.fontColor.price}:enable='between(t,${time})'`);
                filtersAds.push(`drawtext=text='Código ${ad.code}':x=(w-text_w)/2:y=600:fontfile=${fontFamily.ads}:fontsize=${fontSize.ads.code}:fontcolor=${videoConfig.fontColor.code}:enable='between(t,${time})'`);
            }
        });

        const arrayFfmepg = [
            '-i', filePath,
            ...inputImgs,
            '-filter_complex', `[1:v] scale=${scaleImgs} [img1]; [0:v][img1] overlay=${overlayImgs}:enable='between(t,3.1,5.9)' [v0];
                [2:v] scale=${scaleImgs} [img2]; [v0][img2] overlay=${overlayImgs}:enable='between(t,6.1,8.9)' [v1];
                [3:v] scale=${scaleImgs} [img3]; [v1][img3] overlay=${overlayImgs}:enable='between(t,9.1,11.9)',
                ${filterTitle.join(',')},
                ${filtersAds.join(',')},
                drawtext=text='Siga':x=(w-text_w)/2:y=(h-text_h)/3:fontfile=${fontFamily.titleFirstEndPage}:fontsize=${fontSize.titleFirstEndPage}:fontcolor=${videoConfig.fontColor.titleFirstEndPage}:enable='between(t,12.1,15)',
                drawtext=text='nossas':x=(w-text_w)/2:y=(h-text_h)/2.5:fontfile=${fontFamily.titleFirstEndPage}:fontsize=${fontSize.titleFirstEndPage}:fontcolor=${videoConfig.fontColor.titleFirstEndPage}:enable='between(t,12.1,15)',
                drawtext=text='redes sociais':x=(w-text_w)/2:y=(h-text_h)/2.15:fontfile=${fontFamily.titleFirstEndPage}:fontsize=${fontSize.titleFirstEndPage}:fontcolor=${videoConfig.fontColor.titleFirstEndPage}:enable='between(t,12.1,15)',
                drawtext=text='para mais':x=(w-text_w)/2:y=(h-text_h)/1.9:fontfile=${fontFamily.titleFirstEndPage}:fontsize=${fontSize.titleFirstEndPage}:fontcolor=${videoConfig.fontColor.titleFirstEndPage}:enable='between(t,12.1,15)',
                drawtext=text='promoções':x=(w-text_w)/2:y=(h-text_h)/1.7:fontfile=${fontFamily.titleFirstEndPage}:fontsize=${fontSize.titleFirstEndPage}:fontcolor=${videoConfig.fontColor.titleFirstEndPage}:enable='between(t,12.1,15)'`,
            '-c:v',
            'libx264',
            '-preset',
            'ultrafast',
            '-qp',
            '20',
            '-c:a',
            'copy',
            '-y', `${pathVideoOut}`
        ];
        
        await this.validateInputs(post, pathVideoOut);
        
        const hash = Math.random().toString(36).substr(2, 9);
        const outputDir = path.dirname(pathVideoOut);
        const tempPath = path.join(outputDir, `.tmp_${hash}.mp4`);
        const arrayFfmepgWithTmp = arrayFfmepg.slice();
        arrayFfmepgWithTmp[arrayFfmepgWithTmp.length - 1] = tempPath;
        
        Logger.info(`Iniciando FFmpeg para: ${pathVideoOut}`);
        Logger.info(`Inputs: ${arrayFfmepgWithTmp.filter(arg => arg === '-i').length} imagens`);

        return this.withTimeout(
            new Promise(async (resolve, reject) => {
                const resultVideo = spawn(pathToFfmpeg, arrayFfmepgWithTmp);
                let ffmpegOutput = '';
                let ffmpegError = '';

                resultVideo.stdout?.on('data', (data) => {
                    ffmpegOutput += data.toString();
                });

                resultVideo.stderr?.on('data', (data) => {
                    ffmpegError += data.toString();
                    if (data.toString().includes('frame=')) {
                        const match = data.toString().match(/frame=\s*(\d+)/);
                        if (match) {
                            process.stdout.write(`\r[VideoService] Progresso: ${match[1]} frames`);
                        }
                    }
                });

                resultVideo.on('error', (error) => {
                    Logger.error(`Erro ao iniciar FFmpeg: ${error.message}`);
                    this.cleanupTempFile(tempPath);
                    reject(new Error(`FFmpeg processo falhou: ${error.message}`));
                });

                resultVideo.on('close', async (code) => {
                    if (code === 0) {
                        try {
                            await fs.promises.rename(tempPath, pathVideoOut);
                            Logger.success(`Vídeo criado com sucesso: ${pathVideoOut}`);
                            resolve(true);
                        } catch (err) {
                            Logger.error(`Erro ao mover arquivo temporário`, err);
                            await this.cleanupTempFile(tempPath);
                            reject(new Error(`Falha ao finalizar vídeo: ${err.message}`));
                        }
                    } else {
                        Logger.error(`FFmpeg exited with code ${code}`);
                        let errorMsg = `FFmpeg exited with code ${code}`;
                        
                        if (ffmpegError.includes('Unknown encoder')) {
                            errorMsg = 'Encoder libx264 não disponível';
                        } else if (ffmpegError.includes('No such file or directory')) {
                            errorMsg = 'Arquivo de entrada não encontrado';
                        } else if (ffmpegError.includes('File format not recognised')) {
                            errorMsg = 'Formato de arquivo não reconhecido';
                        } else if (ffmpegError.length > 0) {
                            const errorLines = ffmpegError.split('\n').filter(l => l.length > 0);
                            if (errorLines.length > 0) {
                                errorMsg = errorLines[errorLines.length - 1];
                            }
                        }
                        
                        Logger.error(`Erro: ${errorMsg}`);
                        await this.cleanupTempFile(tempPath);
                        reject(new Error(errorMsg));
                    }
                });
            }),
            120000,
            'Criação de vídeo FFmpeg'
        );
    }

    async teste2(filePath = this.filePath) {
        fs.open(filePath, 'r', function (err, fd) {
            try {
                Logger.debug({ fd });
                let movie = VideoLib.MovieParser.parse(fd);
                Logger.info('Duration: ' + movie.relativeDuration());

                let fragmentList = VideoLib.FragmentListBuilder.build(movie, 3);
                Logger.info('Duration fragmentList: ' + fragmentList.relativeDuration());
                fs.open(`${DIR_TEMP}/testes/teste-fragment.idx`, 'w', function (err, fdi) {
                    try {
                        VideoLib.FragmentListIndexer.index(fragmentList, fdi);
                    } catch (ex) {
                        Logger.error('Error:', ex);
                    } finally {
                        fs.closeSync(fdi);
                    }
                });
            } catch (ex) {
                Logger.error('Error:', ex);
            } finally {
                fs.closeSync(fd);
            }
        });
    }

    async teste3(filePath = this.filePath) {
        fs.open(filePath, 'r', function (err, fd) {
            fs.open(`${DIR_TEMP}/testes/teste-fragment.idx`, 'r', function (err, fdi) {
                try {
                    let fragmentList = VideoLib.FragmentListIndexer.read(fdi);
                    Logger.info('Duration: ' + fragmentList.relativeDuration());
                    for (let i = 0; i < fragmentList.count(); i++) {
                        Logger.info('fragmentList.count(): ' + fragmentList.count());
                        let fragment = fragmentList.get(i);
                        let sampleBuffers = VideoLib.FragmentReader.readSamples(fragment, fd);
                        let buffer = VideoLib.HLSPacketizer.packetize(fragment, sampleBuffers);
                        Logger.debug({ buffer });
                    }
                } catch (ex) {
                    Logger.error('Error:', ex);
                } finally {
                    fs.closeSync(fd);
                    fs.closeSync(fdi);
                }
            });
        });
    }
}

module.exports = VideoService;