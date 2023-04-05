const { randomUUID } = require('crypto');
const MagazineLuizaService = require('./services/magazine-luiza.service');
const RestService = require('./services/rest.service');
const File = require('./services/file.service');
const { join } = require('path');
// const DIR_TO_POST = join(__dirname, "./", "toPost");
// const DIR_TEMP = join(__dirname, "./", "temp");
// const pathVideos = join(__dirname, "../../", "Downloads");
const adJson = require('./ad.json');
const { DIR_TO_POST, DIR_TEMP, DIR_VIDEOS, FILE_FOR_CREATE, DIR_TO_CREATE } = require('./core/directory.config');
const ENDPOINTS = require('./core/url.config');
const VideoService = require('./services/video.service');

class Ad {
    magazineLuizaService = null;
    videoService = null;
    numberAdByPost = 3;
    hours = [
        '08:00',
        '12:30',
        '17:30',
        '19:00',
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

    linkBaseSearchProducts = (codes) => `${ENDPOINTS.wedConecta.search}/${codes.join('+')}/`;

    async updateVideosName(videoNumber, videoName, videosFiltered) {
        videosFiltered.forEach(item => {
            if (item === `${videoNumber}.mp4`) {
                File.rename(`${DIR_VIDEOS}/${videoNumber}.mp4`, `${DIR_VIDEOS}/${videoName}.mp4`);
            }
        });
    }

    separateCodeTitleAdTitlePostAndHashtag(contentArray) {
        return contentArray.map(item => {
            const itemSplited = item.split(';');
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
            // TODO: Salvar item em um arquivo como item que falta informação
            return false;
        }).filter(item => item !== false);
    }

    validateThreeCodesForCreate(codesString) {
        return codesString.split('+').length === this.numberAdByPost;
    }
    // filterThreeCodesForCreate(contentArray) {
    //     return contentArray.filter(item => {
    //         return item.split('+').length === this.numberAdByPost;
    //     });
    // }

    getExtension(linkImg) {
        const imgSplit = linkImg.split('.');
        return imgSplit[imgSplit.length - 1];
    }

    downloadImg(linkImg, filePath) {
        return this.restService.downloadImage(linkImg, filePath);
    }

    async step1FilesForCreateVideos(dateFirstPost) {
        let tempContents = [];
        const contentsForCreatePosts = [];
        const codeInvalid = [];
        let { year, month, day } = dateFirstPost;
        let datePost = this.getDate(year, month, day);
        const contentFileSplited = await File.txtForArrayString(FILE_FOR_CREATE);
        const contents = this.separateCodeTitleAdTitlePostAndHashtag(contentFileSplited);
        for (const content of contents) {
            // console.log(content);
            const { codes, titleAd, titlePost, hashtag } = content;
            // const contentFiltered = this.filterThreeCodesForCreate(content.code);
            // for (const content of contentFiltered) {
            const codesFormated = codes.replace(/\//g, '');
            console.log('buscando ...', codesFormated);
            const codesIsValid = await this.magazineLuizaService.verifyCodes(codesFormated, this.numberAdByPost);
            if (codesIsValid) {
                tempContents.push(content);
                if (tempContents.length === this.numberPostsByDay) {
                    contentsForCreatePosts.push({
                        date: this.getDateFormated(datePost),
                        contents: tempContents
                    });
                    tempContents = [];
                    datePost = this.getDatePlusDay(datePost, 1);
                }
            } else {
                codeInvalid.push(content);
            }
            // }
        }

        // console.log({contentsForCreatePosts});

        if (contentsForCreatePosts.length > 0) {
            const dirExists = File.existsSync(DIR_TO_CREATE);
            if (!dirExists) await File.mkdir(DIR_TO_CREATE);
            for (const postsDay of contentsForCreatePosts) {
                // console.log(post);
                const { date } = postsDay;
                const dateSplit = date.split('-');
                const day = Number(dateSplit[2]);
                const month = Number(dateSplit[1]);
                const year = Number(dateSplit[0]);

                const datePost = this.getDateFormated(this.getDate(year, month, day));
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
                        this.downloadImg(linkImg, pathImg);
                        print += `${product.title}\n${product.price}\n${product.code}\n${pathImg}\n${product.link}\n\n`;
                        countProduct++;
                    }

                    postDay.posts.push({
                        titlePost,
                        titleVideo,
                        hashtags: hashtag.split(' ').map(hashtag => hashtag.indexOf('#') > -1 ? hashtag : `#${hashtag}`),
                        ads: allProducts
                    });
                    countPost++;
                }

                const pathJsonAd = join(pathDateTitle, `for-create-post-Ad.json`);
                await File.writeFile(pathJsonAd, JSON.stringify(postDay));
                const pathTxtForCreateVideo = join(pathDateTitle, `for-create-videos.txt`);
                await File.writeFile(pathTxtForCreateVideo, print);

                // TODO: Chamar função para criar os videos
                await this.createVideos(postDay);
                // TODO: Chamar função para criar txt com informações do post (usar arquivo json criado acima)
                await this.step2FilesForTitleAndComments(postDay);
            }
        }

        if (tempContents.length > 0) {
            // TODO: Códigos que não atingiram a quantidade necessária para os posts do dia
            // TODO: Manter esses códigos não utilizados em forCreateAd.txt
        }

        if (codeInvalid.length > 0) {
            // TODO: remover linha do arquivo forCreateAd.txt
            // Talvez adicionar em um arquivo de códigos não utilizados!
            // await writeFile(join(DIR_SERVICES, '../temp/', `codeInvalid.txt`), codeInvalid.join('\n'));
        }
        // console.log('codesForCreatePosts: ', codesForCreatePosts);
        console.log({ tempContents });
        console.log({ codeInvalid });
    }

    async createVideos(postDay) {
        const dirExists = File.existsSync(DIR_TO_POST);
        if (!dirExists) await File.mkdir(DIR_TO_POST);
        const { date: { year, month, day } } = postDay;
        const datePost = this.getDateFormated(this.getDate(year, month, day));
        const pathDateTitle = join(DIR_TO_POST, datePost);
        const dirDateExists = File.existsSync(pathDateTitle);
        if (!dirDateExists) await File.mkdir(pathDateTitle);
        let count = 1;
        for (const post of postDay.posts) {
            const { titlePost, titleVideo } = post;
            try {
                const fileVideoName = `${count}_${titlePost}_${randomUUID()}.mp4`;
                const pathPostVideo = join(pathDateTitle, fileVideoName);
                const result = await this.videoService.createVideo(post, pathPostVideo);
                if(result) console.log(`Vídeo ${titleVideo} criado com sucesso!`);
            } catch (error) {
                console.log(`Error ao criar o video ${titleVideo} `);
            }
            count++;
        }
    }

    async step2FilesForTitleAndComments(postDay) {
        const dirExists = File.existsSync(DIR_TO_POST);
        if (!dirExists) await File.mkdir(DIR_TO_POST);
        let count = 1;

        for (const anuncio of postDay.posts) {
            const codes = anuncio.ads.map(ad => ad.code);
            const linkProducts = this.linkBaseSearchProducts(codes);

            const { date: { year, month, day } } = postDay;
            const { titlePost, hashtags } = anuncio;
            const youtube = this.getYoutubeDescription(titlePost, linkProducts, hashtags);
            const tiktok = this.getTiktokDescription(titlePost, hashtags);
            const meta = this.getMetaDescription(titlePost, hashtags);
            const datePost = this.getDateFormated(this.getDate(year, month, day));

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
            await File.writeFile(join(pathDateTitle, fileName), content);
            // const videoName = `${datePost}_${count}_${titlePost}`;
            // this.updateVideosName(count, videoName, videosFiltered);
            count++;
        }
    }
    // async step1FilesForCreateVideos(dateFirstPost) {
    //     let tempCodes = [];
    //     const codesForCreatePosts = [];
    //     const codeInvalid = [];
    //     let { year, month, day } = dateFirstPost;
    //     let datePost = this.getDate(year, month, day);
    //     const contentFileSplited = await File.txtForArrayString(FILE_FOR_CREATE);
    //     const contents = this.separateCodeTitleAdTitlePostAndHashtag(contentFileSplited);
    //     for (const content of contents) {


    //     }
    //     const contentFiltered = this.filterThreeCodesForCreate(content);
    //     for (const content of contentFiltered) {
    //         const codesFormated = content.replace(/\//g, '');
    //         console.log('buscando ...', codesFormated);
    //         const codesIsValid = await this.magazineLuizaService.verifyCodes(codesFormated, this.numberAdByPost);
    //         if (codesIsValid) {
    //             tempCodes.push(codesFormated);
    //             if (tempCodes.length === this.numberPostsByDay) {
    //                 codesForCreatePosts.push({
    //                     date: this.getDateFormated(datePost),
    //                     codes: tempCodes,
    //                     products: []
    //                 });
    //                 tempCodes = [];
    //                 datePost = this.getDatePlusDay(datePost, 1);
    //             }
    //         } else {
    //             codeInvalid.push(codesFormated);
    //         }
    //     }

    //     if (codesForCreatePosts.length > 0) {
    //         for (const itens of codesForCreatePosts) {
    //             const allProducts = await this.magazineLuizaService.getProducts(itens.codes, this.numberAdByPost);
    //             itens.products = allProducts;
    //             let print = `Posts do dia ${itens.date}\n\n`;
    //             print += itens.products.map((product, key) => {
    //                 const productsPost = product.map((item, keyProduct) => {
    //                     const linkImg = item.img;
    //                     const ext = this.getExtension(linkImg);
    //                     const imgName = `${itens.date}-Step-1-Post-${key + 1}-Image-${keyProduct + 1}-${item.code}`;
    //                     this.downloadImg(linkImg, `${DIR_TO_CREATE}/${imgName}.${ext}`)
    //                     // TODO: criar obj json para criar video
    //                     return `${item.title}\n${item.price}\n${item.code}\n${imgName}\n${item.link}`;
    //                 }).join('\n\n');
    //                 return `POST ${key + 1}\n\n${productsPost}`;
    //             }).join('\n\n');
    //             await File.writeFile(join(DIR_TO_CREATE, `${itens.date}-Step-1-Create-videos.txt`), print);
    //             const dateSplit = itens.date.split('-');
    //             const fileAd = {
    //                 date: {
    //                     day: Number(dateSplit[2]),
    //                     month: Number(dateSplit[1]),
    //                     year: Number(dateSplit[0])
    //                 },
    //                 ad: itens.products.map(product => {
    //                     return {
    //                         title: 'Seleção de',
    //                         codes: product.map(item => item.code),
    //                         hashtags: []
    //                     }
    //                 })
    //             }
    //             await File.writeFile(join(DIR_TO_CREATE, `${itens.date}-Step-2-Ad.json`), JSON.stringify(fileAd));
    //         }
    //     }

    //     if (tempCodes.length > 0) {
    //         // TODO: Códigos que não atingiram a quantidade necessária para os posts do dia
    //         // TODO: Manter esses códigos não utilizados em forCreateAd.txt
    //     }

    //     if (codeInvalid.length > 0) {
    //         // TODO: remover linha do arquivo forCreateAd.txt
    //         // Talvez adicionar em um arquivo de códigos não utilizados!
    //         // await writeFile(join(DIR_SERVICES, '../temp/', `codeInvalid.txt`), codeInvalid.join('\n'));
    //     }
    //     // console.log('codesForCreatePosts: ', codesForCreatePosts);
    //     console.log({ tempCodes });
    //     console.log({ codeInvalid });
    // }

    // async step2FilesForTitleCommentsAndRenameVideos() {
    //     const itensDir = await File.readdir(DIR_VIDEOS);
    //     const videosFiltered = itensDir.filter(item => {
    //         return ['1.mp4', '2.mp4', '3.mp4', '4.mp4'].includes(item);
    //     });
    //     const dirExists = File.existsSync(DIR_TO_POST);
    //     if (!dirExists) File.mkdir(DIR_TO_POST);
    //     let count = 1;

    //     for (const anuncio of this.anuncios.ad) {
    //         const linkProducts = this.linkBaseSearchProducts(anuncio.codes);
    //         const { date: { year, month, day } } = this.anuncios;
    //         const { title, hashtags } = anuncio;
    //         const youtube = this.getYoutubeDescription(title, linkProducts, hashtags);
    //         const tiktok = this.getTiktokDescription(title, hashtags);
    //         const meta = this.getMetaDescription(title, hashtags);
    //         const datePost = this.getDateFormated(this.getDate(year, month, day));

    //         const pathDateTitle = join(DIR_TO_POST, datePost);
    //         const dirDateExists = File.existsSync(pathDateTitle);
    //         if (!dirDateExists) File.mkdir(pathDateTitle);

    //         const content = [`Postar nos horários: ${this.hours.join(' - ')}\n\n`];
    //         content.push(`${datePost} ${title}\n`);
    //         content.push(`${linkProducts}\n\n`);
    //         content.push('******************************************** YOUTUBE\n');
    //         content.push(youtube.title);
    //         content.push(youtube.description);
    //         content.push('\n\n');
    //         content.push('******************************************** META REELS\n');
    //         content.push(meta);
    //         content.push('\n\n');
    //         content.push('******************************************** TIKTOK\n');
    //         content.push(tiktok);

    //         const fileName = `${count}_${title}_${randomUUID()}.txt`;
    //         await File.writeFile(join(pathDateTitle, fileName), content);
    //         this.createVideo(pathDateTitle, fileName);
    //         // const videoName = `${datePost}_${count}_${title}`;
    //         // this.updateVideosName(count, videoName, videosFiltered);
    //         count++;
    //     }
    // }

    // createVideo(pathDateTitle, videoName) {
    //     const post = {
    //         title: 'Seleção ovo de páscoa',
    //         ads: {
    //             '1': {
    //                 title: 'Chocolate nest nestl em barras 100gr Chocolate nestle em barras 100gr Chocolate nestle em barras 100gr Chocolate nest nestl em barras 100gr Chocolate nestle em barras 100gr Chocolate nestle em barras 100gr',
    //                 price: 'R$ 1.259,99',
    //                 code: 'a4f65465dsaf',
    //                 imgName: 'product1.jpeg'
    //             },
    //             '2': {
    //                 title: 'Chocolate garoto 250gr Chocolate garoto barras 250gr',
    //                 price: 'R$ 89,00',
    //                 code: 'ej51b65heg',
    //                 imgName: 'product2.jpeg'
    //             },
    //             '3': {
    //                 title: 'Chocolate talento em barras 150gr',
    //                 price: 'R$ 29,99',
    //                 code: 'ag5g4dd21b',
    //                 imgName: 'product3.jpeg'
    //             }
    //         }
    //     }
    //     this.videoService.createVideo(post, join(pathDateTitle, `${videoName}.mp4`));
    // }
    // async step2FilesForTitleCommentsAndRenameVideos() {
    //     const itensDir = await File.readdir(DIR_VIDEOS);
    //     const videosFiltered = itensDir.filter(item => {
    //         return ['1.mp4', '2.mp4', '3.mp4', '4.mp4'].includes(item);
    //     });
    //     const dirExists = File.existsSync(DIR_TO_POST);
    //     if (!dirExists) await File.mkdir(DIR_TO_POST);
    //     let count = 1;

    //     for (const anuncio of this.anuncios.ad) {
    //         const linkProducts = this.linkBaseSearchProducts(anuncio.codes);
    //         const { date: { year, month, day } } = this.anuncios;
    //         const { title, hashtags } = anuncio;
    //         const youtube = this.getYoutubeDescription(title, linkProducts, hashtags);
    //         const tiktok = this.getTiktokDescription(title, hashtags);
    //         const meta = this.getMetaDescription(title, hashtags);
    //         const datePost = this.getDateFormated(this.getDate(year, month, day));

    //         const pathDateTitle = join(DIR_TO_POST, datePost);
    //         const dirDateExists = File.existsSync(pathDateTitle);
    //         if (!dirDateExists) await File.mkdir(pathDateTitle);

    //         const content = [`Postar nos horários: ${this.hours.join(' - ')}\n\n`];
    //         content.push(`${datePost} ${title}\n`);
    //         content.push(`${linkProducts}\n\n`);
    //         content.push('******************************************** YOUTUBE\n');
    //         content.push(youtube.title);
    //         content.push(youtube.description);
    //         content.push('\n\n');
    //         content.push('******************************************** META REELS\n');
    //         content.push(meta);
    //         content.push('\n\n');
    //         content.push('******************************************** TIKTOK\n');
    //         content.push(tiktok);

    //         const fileName = `${count}_${title}_${randomUUID()}.txt`;
    //         await File.writeFile(join(pathDateTitle, fileName), content);
    //         const videoName = `${datePost}_${count}_${title}`;
    //         this.updateVideosName(count, videoName, videosFiltered);
    //         count++;
    //     }
    // }

    getTiktokDescription(titleComom, hashtags) {
        // Tiktok
        const title = `${titleComom} - Link na BIO #parceiromagalu #achadinhos #promo #promotion #sale ${hashtags.join(' ')}`
        return title;
    }

    getYoutubeDescription(titleComom, linkProducts, hashtags) {
        // YouTube
        const title = `${titleComom} #shorts da @wedconecta\n\n`;
        let description = `Link para os produtos: ${linkProducts}\n\n`;
        description += `Siga nossas redes sociais:\n`;
        description += `Instagram: https://www.instagram.com/wedconecta\n`;
        description += `Facebook: https://www.facebook.com/wedconecta\n`;
        description += `TikTok: https://www.tiktok.com/@wedconecta\n\n`;
        description += `#shorts da @wedconecta\n`;
        description += `#achadinhos #achados #parceiromagalu #wedconecta #promoção #promo #promotion #ofertas ${hashtags.join(' ')}\n`;

        return { title, description };
    }

    getMetaDescription(titleComom, hashtags) {
        // Instagram e Facebook
        let description = `${titleComom}\nLink da loja na BIO\n\n`;
        description += `Siga nossas redes sociais:\n`;
        description += `YouTube: https://www.youtube.com/@wedconecta\n`;
        description += `TikTok: https://www.tiktok.com/@wedconecta\n`;
        description += `Instagram: https://www.instagram.com/wedconecta\n`;
        description += `Facebook: https://www.facebook.com/wedconecta\n\n`;

        description += `#achadinhos #achados #parceiromagalu #wedconecta #promoção #promo #promotion #ofertas ${hashtags.join(' ')}`;

        return description;
    }
}

module.exports = Ad;