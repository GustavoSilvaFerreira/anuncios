const RestService = require('./rest.service');
const ENDPOINTS = require('../core/url.config');
const File = require('../services/file.service');
const cheerio = require('cheerio');
const { DIR_TEMP } = require('../core/directory.config');

class MagazineLuizaService {
    restService = null;
    imgSize = '618x463';
    itensTagHtml = 'li.sc-leQnM';

    constructor(
        restService = new RestService()
    ) {
        this.restService = restService;
    }

    search(search) {
        return this.restService.get(`${ENDPOINTS.wedConecta.search}/${search}/`);
    }

    async loadHtmlCheerio(codesFormated) {
        const result = await this.search(codesFormated);
        // console.log(result.data);
        // await File.writeFile(`${DIR_TEMP}/html-teste.html`, result.data)
        return cheerio.load(result.data);
    }

    async getListOfProductsByHtmlLoaded(cheerio) {
        return cheerio(this.itensTagHtml);
    }

    async getListOfProductsByCodes(codesFormated) {
        const $ = await this.loadHtmlCheerio(codesFormated);
        console.log($(this.itensTagHtml).length);
        return $(this.itensTagHtml);
    }

    async verifyCodes(codesFormated, numberAdByPost) {
        const resultLi = await this.getListOfProductsByCodes(codesFormated);
        // console.log('resultLi');
        // console.log({resultLi});
        return resultLi.length >= numberAdByPost;
    }

    formatCodesForSearch(codes) {
        return codes.join('+');
    }

    async getProductsByCodesFormated(codesFormated, numberAdByPost) {
        let products = [];
        const $ = await this.loadHtmlCheerio(codesFormated);
        const itensLi = await this.getListOfProductsByHtmlLoaded($);
        if(itensLi.length >= numberAdByPost) {
            const itensImg = $(`${this.itensTagHtml} > a > div.sc-cDnByv > img`);
            const itensHref = $(`${this.itensTagHtml} > a`);
            let itensPrice = $(`${this.itensTagHtml} > a > div.sc-fvwjDU > div.sc-fqkvVR > div > div > p`);
            if(!itensPrice) {
                itensPrice = $(`${this.itensTagHtml} > a > div.sc-fvwjDU > div.sc-fqkvVR > div > p`);
            }
            const indexs = this.createIndexForValidation(itensLi.length);
            indexs.forEach(index => {
                if(index <= numberAdByPost) {
                    const href = itensHref[index].attribs['href'];
                    const title = itensImg[index].attribs['title'];
                    const link = `${ENDPOINTS.parceiroMagulu.base}${href}`;
                    const code = href.split('/')[4];
                    const imgLink = itensImg[index].attribs['src'].replace('280x210', this.imgSize);
                    const price = itensPrice[index].children.filter(item => item.type === 'text')[0].data;
                    console.log({price});
                    products.push({title, code, imgLink, price, link});
                }
            });
        }
        return products;
    }

    async getProducts(codes, numberAdByPost) {
        let products = [];
        const allProducts = [];
        for (const codesFormated of codes) {
            const $ = await this.loadHtmlCheerio(codesFormated);
            const itensLi = await this.getListOfProductsByHtmlLoaded($);
            console.log(itensLi);
            if(itensLi.length === numberAdByPost) {
                const itensImg = $(`${this.itensTagHtml} > a > img`);
                const itensTitleAndHref = $(`${this.itensTagHtml} > div > a`);
                const itensPrice = $(`${this.itensTagHtml} > div > p > strong`);
                const indexs = this.createIndexForValidation(itensLi.length);
                indexs.forEach(index => {
                    const title = itensTitleAndHref[index].attribs['title'];
                    const link = `${ENDPOINTS.parceiroMagulu.base}${itensTitleAndHref[index].attribs['href']}`;
                    const code = itensLi[index].attribs['data-productid'];
                    const imgLink = itensImg[index].attribs['data-original'].replace('160x160', this.imgSize);
                    const price = itensPrice[index].children.filter(item => item.type === 'text')[0].data;
                    console.log(imgLink);
                    products.push({title, code, imgLink, price, link});
                });
                allProducts.push(products);
                products = [];
            }
        }
        return allProducts;
    }

    // filterThreeCodesForCreate(contentArray) {
    //     return contentArray.filter(item => {
    //         return item.split('+').length === this.numberAdByPost;
    //     });
    // }

    createIndexForValidation(number) {
        return Object.keys(new Array(number).fill(null));
    }
}

module.exports = MagazineLuizaService;