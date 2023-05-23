const { DIR_TEMP, DIR_FONT, DIR_TO_POST, DIR_VIDEOS } = require("../core/directory.config");

const { open, } = require('node:fs/promises');
const fs = require('node:fs');
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
                if (result) console.log(`Vídeo ${post.titleVideo} criado com sucesso!`);
            } catch (error) {
                console.log(`Error ao criar o video ${post.titleVideo} `);
            }
            count++;
        }
    }

    // timeByIndex(index) {
    //     return {
    //         '1': '3.1,5.9',
    //         '2': '6.1,8.9',
    //         '3': '9.1,11.9',
    //     }[index];
    // }

    validateAdsCharacter(ads) {
        const regex = /([\u0300-\u036f]|[^0-9a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\#\ \$\*\(\)\=\/\;\.\,\-\_\\])/g;
        for (const item of ads) {
            Object.keys(item).forEach(key => {
                if (key === 'title' || key === 'code' || key === 'price') {
                    const text = item[key].replace(regex, '');
                    item[key] = text;
                }
            });
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
        const randomNumber = Math.floor(Math.random() * this.videosRandom.length);
        const keyVideoRandom = randomNumber > (this.videosRandom.length - 1) ? 0 : randomNumber;
        const videoTemplateSelected = this.videosRandom[keyVideoRandom];
        const template = this.VIDEOS_CONFIG[videoTemplateSelected.template];
        const templateColorSelected = template.templateColor[videoTemplateSelected.templateColor];
        this.videosRandom.splice(keyVideoRandom, 1);
        return { template, templateColorSelected };
    }

    async createVideo(post, pathVideoOut) {
        this.validateAdsCharacter(post.ads);
        // Seleciona o template
        // const template = this.VIDEOS_CONFIG.template_1;
        if (this.videosRandom.length === 0) {
            this.setVideosRandom();
        }
        // Seleciona de forma aleatória a cor do template
        // const randomNumber = Math.floor(Math.random() * this.videosRandom.length);
        // const keyVideoRandom = randomNumber > (this.videosRandom.length - 1) ? 0 : randomNumber;
        // const videoTemplateSelected = this.videosRandom[keyVideoRandom];
        // const template = this.VIDEOS_CONFIG[videoTemplateSelected.template];
        // const templateColorSelected = template.templateColor[videoTemplateSelected.templateColor];
        // this.videosRandom.splice(keyVideoRandom, 1);
        const { template, templateColorSelected } = this.getTemplateVideoSelected();

        // const arrayTemplateColor = Object.keys(template.templateColor);
        // const randomNumber = Math.floor(Math.random() * arrayTemplateColor.length);
        // const keyTemplateColorRandom = randomNumber > (arrayTemplateColor.length - 1) ? 0 : randomNumber;
        // const templateColorSelected = template.templateColor[arrayTemplateColor[keyTemplateColorRandom]];

        // Atribui as configurações do template para serem utilizadas durante a criação do vídeo
        const fontFamily = template.fontFamily;
        const fontSize = template.fontSize;
        const scaleImgs = template.scaleImgs;
        const overlayImgs = template.overlayImgs;
        const timeByIndex = template.timeByIndex;
        const filePath = templateColorSelected.filePath;
        const videoConfig = templateColorSelected;

        console.log('init create video...');

        if (fs.existsSync(`${DIR_TEMP}/testes/saida.mp4`)) await fs.rm(`${DIR_TEMP}/testes/saida.mp4`, () => { console.log('deleted!'); });

        // Title page 1
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
        // console.log(filterTitle);

        // Ads
        const inputImgs = [];
        const filtersAds = [];

        const titleAdsLimitLength = 99;
        const setTitleFormated = (titleFormated, index, text) => {
            // console.log('index: ', index, 'text: ', text);
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
                // inputImgs.push(pathImages + `product${index + 1}.jpeg`);
                // inputImgs.push(pathImages + post.imgName);
                inputImgs.push(ad.imgPath);
                // inputImgs.push('C:\\Users\\guto7\\workspace\\anuncios\\temp\\toCreate\\2023-04-5\\img-for-create-video-post-1-image-1-ea5ga2c60h.jpeg');
                // inputImgs.push('C:/Users/guto7/workspace/anuncios/temp/toCreate/2023-04-5/img-for-create-video-post-1-image-3-ej917fee62.jpeg');

                const titleSplit = ad.title.split(' ');
                let indexTitle = 1;
                let titleAds = {};

                titleSplit.forEach(titleSplited => {
                    indexTitle = setTitleFormated(titleAds, indexTitle, titleSplited);
                });
                // console.log({titleAds});
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
        // console.log(arrayFfmepg);
        return new Promise((resolve, reject) => {
            const resultVideo = spawn(pathToFfmpeg, arrayFfmepg);
            resultVideo.on('close', function (code) {
                // console.log('on: ', code);
                // console.log('end create video...');
                if (code == 1) {
                    reject(false);
                }
                resolve(true);
            });
        });

        // spawn(pathToFfmpeg, [
        //     '-i', filePath,
        //     ...inputImgs,
        //     // '-i', pathImages + posts['1'].imgName,
        //     // '-i', pathImages + posts['2'].imgName,
        //     // '-i', pathImages + posts['3'].imgName,
        //     '-filter_complex', `[1:v] scale=${scaleImgs} [img1]; [0:v][img1] overlay=${overlayImgs}:enable='between(t,3,6)' [v0];
        //         [2:v] scale=${scaleImgs} [img2]; [v0][img2] overlay=${overlayImgs}:enable='between(t,6,9)' [v1];
        //         [3:v] scale=${scaleImgs} [img3]; [v1][img3] overlay=${overlayImgs}:enable='between(t,9,12)',
        //         ${filterTitle.join(',')},
        //         ${filtersAds.join(',')},
        //         drawtext=text='Siga':x=(w-text_w)/2:y=(h-text_h)/3:fontfile=${fontFamily.titleFirstEndPage}:fontsize=${fontSize.titleFirstEndPage}:fontcolor=#723F33:enable='between(t,12,15)',
        //         drawtext=text='nossas':x=(w-text_w)/2:y=(h-text_h)/2.5:fontfile=${fontFamily.titleFirstEndPage}:fontsize=${fontSize.titleFirstEndPage}:fontcolor=#723F33:enable='between(t,12,15)',
        //         drawtext=text='redes sociais':x=(w-text_w)/2:y=(h-text_h)/2.15:fontfile=${fontFamily.titleFirstEndPage}:fontsize=${fontSize.titleFirstEndPage}:fontcolor=#723F33:enable='between(t,12,15)',
        //         drawtext=text='para mais':x=(w-text_w)/2:y=(h-text_h)/1.9:fontfile=${fontFamily.titleFirstEndPage}:fontsize=${fontSize.titleFirstEndPage}:fontcolor=#723F33:enable='between(t,12,15)',
        //         drawtext=text='promoções':x=(w-text_w)/2:y=(h-text_h)/1.7:fontfile=${fontFamily.titleFirstEndPage}:fontsize=${fontSize.titleFirstEndPage}:fontcolor=#723F33:enable='between(t,12,15)'`,
        //     '-c:v', 'libx264',
        //     '-preset', 'ultrafast',
        //     '-qp', '20',
        //     '-c:a', 'copy',
        //     // '-y', 'vid01.mp4'
        //     // '-y', `${pathVideoOut}`
        //     '-y', `${DIR_TEMP}/testes/saida.mp4`

        //     // '-i', filePath,
        //     // '-f', 'mp4',
        //     // '-i', img1,
        //     // '-i', img2,
        //     // '-i', img3,
        //     // '-f', 'jpeg',
        //     // '-vcodec', 'h264',
        //     // '-acodec', 'aac',
        //     // '-filter_complex', `[0:v] drawtext=text='${title}':x=(w-text_w)/2:y=(h-text_h)/2.6:fontfile=${fontFamily}:fontsize=${fontSizeTitle}:fontcolor=#723F33:enable='between(t,0,3)',
        //     // [0:v] drawtext=text='${title2}':x=(w-text_w)/2:y=(h-text_h)/2.15:fontfile=${fontFamily}:fontsize=${fontSizeTitle}:fontcolor=#723F33:enable='between(t,0,3)',
        //     // [0:v] drawtext=text='${title3}':x=(w-text_w)/2:y=(h-text_h)/1.85:fontfile=${fontFamily}:fontsize=${fontSizeTitle}:fontcolor=#723F33:enable='between(t,0,3)',
        //     // [0:v] drawtext=text='${post1.title}':x=(w-text_w)/2:y=100:font=arial:fontsize=65:fontcolor=#ffffff:enable='between(t,3,6)'`,
        //     // '-filter_complex', "[1] scale=320:320 [img1]; [0][img1] overlay=25:25:enable='between(t,0,1)' [v1]; [v1][2] scale=320:320 [img2]; [0][img2] overlay=25:25:enable='between(t,1,2)'",
        //     // '-vf', `movie='${filePath}', scale=320:240 [pip]; [in][pip] overlay=10:10`,
        //     // '-filter_complex', "[0:v][1:v] overlay=25:25:enable='between(t,0,1)';[0:v][2:v] overlay=25:25:enable='between(t,1,2)'",
        //     // '-pix_fmt', 'yuv420p',
        //     // '-c:a', 'copy',
        //     // `${DIR_TEMP}/testes/saida.mp4`
        // ]);


        // spawn(pathToFfmpeg, [
        //     // '-i', `${DIR_TEMP}/testes/title.jpg`,
        //     // '-f', 'jpg',
        //     // '-vcodec', 'h264',
        //     // '-acodec', 'aac',
        //     // '-framerate', '1/2',
        //     // '-pattern_type', 'glob',
        //     // '-c:v', 'libx264',
        //     // '-r', '30',
        //     // `${DIR_TEMP}/testes/SAIDA.mp4`
        //     '-i', filePath,
        //     // '-f', 'mp4',
        //     '-i', img1,
        //     '-vcodec', 'h264',
        //     '-acodec', 'aac',
        //     '-vf', `drawtext=text='${title}':x=(w-text_w)/2:y=(h-text_h)/2.6:fontfile=${fontFamily}:fontsize=${fontSizeTitle}:fontcolor=#723F33:enable='between(t,0,3)',
        //     drawtext=text='${title2}':x=(w-text_w)/2:y=(h-text_h)/2.15:fontfile=${fontFamily}:fontsize=${fontSizeTitle}:fontcolor=#723F33:enable='between(t,0,3)',
        //     drawtext=text='${title3}':x=(w-text_w)/2:y=(h-text_h)/1.85:fontfile=${fontFamily}:fontsize=${fontSizeTitle}:fontcolor=#723F33:enable='between(t,0,3)',
        //     drawtext=text='${post1.title}':x=(w-text_w)/2:y=100:font=arial:fontsize=65:fontcolor=#ffffff:enable='between(t,3,6)'`,
        //     // '-filter_complex', "[0:v][1:v] overlay=25:25:enable='between(t,0,3)'",

        //     // '-vf', "drawtext=fontfile=/path/to/font.ttf:text='Stack Overflow':fontcolor=white:fontsize=24:box=1:boxcolor=black@0.5:boxborderw=5:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,0,3)'",
        //     // '-vf', "drawtext=fontfile=/path/to/font.ttf:text='Stack Overflow':fontcolor=white:fontsize=24:box=1:boxcolor=black@0.5:boxborderw=5:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,0,3)',drawtext=fontfile=/path/to/font.ttf:text='Bottom right text':fontcolor=black:fontsize=30:x=w-tw-10:y=h-th-100:enable='between(t,3,6)'",
        //     // '-vf', `drawtext=text='${title}':x=360:y=H-th-900:font=arial:fontsize=100:fontcolor=#723F33:enable='between(t,0,3)`,
        //     // '-vf', `drawtext=text='${title}':x=360:y=H-th-90siglas0:fontfile='${DIR_FONT}/Gagalin-Regular.ttf':fontsize=100:fontcolor=#723F33:enable='between(t,0,3)`,
        //     // '-vf', `drawtext=text='${post1.title}':x=30:y=H-th-1650:font=arial:fontsize=65:fontcolor=#ffffff:enable='between(t,3,6)`,
        //     `${DIR_TEMP}/testes/saida.mp4`
        // ]);
        // spawn(pathToFfmpeg, [
        //     '-i', filePath,
        //     '-f', 'mp4',
        //     '-vcodec', 'h264',
        //     '-acodec', 'aac',
        //     '-vf', `drawtext=text='${title}':x=360:y=H-th-900:font=arial:fontsize=100:fontcolor=#723F33`,
        //     `${DIR_TEMP}/testes/saida.mp4`
        // ])

        // var proc = ffmpeg(`${DIR_TEMP}/testes/1-jpg.jpg`)
        // var proc = ffmpeg(fs.createReadStream(filePath))
        // ffmpeg.getAvailableFormats(function(err, formats) {
        //     console.log('Available formats:');
        //     console.dir(formats);
        //     fs.writeFileSync(`${DIR_TEMP}/testes/formats.json`, JSON.stringify(formats))
        //   });
        // const video1 = await new Promise((resolve, reject) => {
        //     ffmpeg()
        //         .addInput(`${DIR_TEMP}/testes/1-jpg.jpg`)
        //         .loop(1)
        //         .addOptions(['-c:v', 'libx264', '-pix_fmt', 'yuv420p'])
        //         .addInput(`${DIR_TEMP}/testes/title-copia.jpg`)
        //         .loop(1)
        //         .addOptions(['-c:v', 'libx264', '-pix_fmt', 'yuv420p'])
        //         // .addOptions(["-loop 1", "-t 4", `-i ${DIR_TEMP}/testes/title-copia.jpg`])
        //         // .fps(30)
        //         // .format('gif')
        //         // .mergeAdd(`${DIR_TEMP}/testes/title-copia.jpg`)
        //         // .loop(6)
        //         // .fps(30)
        //         .on('end', function () {
        //             console.log('file has been converted succesfully');
        //             resolve(true)
        //         })
        //         .on('error', function (err) {
        //             console.log('an error happened: ' + err.message);
        //             reject(false)
        //         })
        //         .saveToFile(`${DIR_TEMP}/testes/teste-video-1.mp4`)
        //         // .save(`${DIR_TEMP}/testes/teste-video-1.mp4`)
        //         // .mergeToFile(`${DIR_TEMP}/testes/merged-video.mp4`)
        // });

        // const video1 = await new Promise((resolve, reject) => {
        //     ffmpeg()
        //         .input(`${DIR_TEMP}/testes/1-jpg.jpg`)
        //         .loop(3)
        //         .fps(30)
        //         .on('end', function () {
        //             console.log('file has been converted succesfully');
        //             resolve(true)
        //         })
        //         .on('error', function (err) {
        //             console.log('an error happened: ' + err.message);
        //             reject(false)
        //         })
        //         .save(`${DIR_TEMP}/testes/teste-video-1.mp4`)
        // });

        // const video2 = await new Promise((resolve, reject) => {
        //     ffmpeg()
        //         .input(`${DIR_TEMP}/testes/title.jpg`)
        //         .loop(3)
        //         .fps(30)
        //         .on('end', function () {
        //             console.log('file has been converted succesfully');
        //             resolve(true)
        //         })
        //         .on('error', function (err) {
        //             console.log('an error happened: ' + err.message);
        //             reject(false)
        //         })
        //         .save(`${DIR_TEMP}/testes/teste-video-2.mp4`)
        // });

        // if(video1 && video2) {
        //     ffmpeg(`${DIR_TEMP}/testes/teste-video-1.mp4`)
        //         .input(`${DIR_TEMP}/testes/teste-video-2.mp4`)
        //         .on('end', function () {
        //             console.log('file has been converted succesfully');
        //         })
        //         .on('error', function (err) {
        //             console.log('an error happened: ' + err.message);
        //         })
        //         .mergeToFile(`${DIR_TEMP}/testes/merged-video.mp4`)
        // }

        // .mergeToFile(`${DIR_TEMP}/testes/merged-video.mp4`, `${DIR_TEMP}/testes`)
        // save to file
        // .save(`${DIR_TEMP}/testes/teste-video.mp4`)
        // const command = ffmpeg(fs.createReadStream(filePath))
        // var writeStream = fs.createWriteStream(`${DIR_TEMP}/testes/teste-alterado.mp4`);
        // const command = ffmpeg()
        //     .addInput(`${DIR_TEMP}/testes/2.png`)
        //     .loop(5)
        //     .addOutputOptions('-movflags +frag_keyframe+separate_moof+omit_tfhd_offset+empty_moov')
        //     .format('mp4')
        //     .pipe(writeStream);
        //     // .videoFilters(['pad=640:480:0:40:violet'])
        // console.log({command});

        // command.save(`${DIR_TEMP}/testes/teste-alterado.mp4`);
    }

    async teste2(filePath = this.filePath) {
        fs.open(filePath, 'r', function (err, fd) {
            try {
                console.log({ fd });
                let movie = VideoLib.MovieParser.parse(fd);
                // Work with movie
                console.log('Duration:', movie.relativeDuration());

                let fragmentList = VideoLib.FragmentListBuilder.build(movie, 3);
                console.log('Duration fragmentList:', fragmentList.relativeDuration());
                fs.open(`${DIR_TEMP}/testes/teste-fragment.idx`, 'w', function (err, fdi) {
                    try {
                        VideoLib.FragmentListIndexer.index(fragmentList, fdi);
                    } catch (ex) {
                        console.error('Error:', ex);
                    } finally {
                        fs.closeSync(fdi);
                    }
                });
            } catch (ex) {
                console.error('Error:', ex);
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
                    console.log('Duration:', fragmentList.relativeDuration());
                    for (let i = 0; i < fragmentList.count(); i++) {
                        console.log('fragmentList.count():', fragmentList.count());
                        let fragment = fragmentList.get(i);
                        let sampleBuffers = VideoLib.FragmentReader.readSamples(fragment, fd);
                        let buffer = VideoLib.HLSPacketizer.packetize(fragment, sampleBuffers);
                        console.log({ buffer });
                        // Now buffer contains MPEG-TS chunk
                    }
                } catch (ex) {
                    console.error('Error:', ex);
                } finally {
                    fs.closeSync(fd);
                    fs.closeSync(fdi);
                }
            });
        });
    }
}

module.exports = VideoService;