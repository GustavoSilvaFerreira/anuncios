const RestService = require('./rest.service');
const ENDPOINTS = require('../core/url.config');
// const File = require('../services/file.service');
const cheerio = require('cheerio');

class MagazineLuizaService {
    restService = null;
    imgSize = '618x463';

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
        return cheerio.load(result.data);
    }

    async getListOfProductsByHtmlLoaded(cheerio) {
        return cheerio('li.g-item');
    }

    async getListOfProductsByCodes(codesFormated) {
        const $ = await this.loadHtmlCheerio(codesFormated);
        return $('li.g-item');
    }

    async verifyCodes(codesFormated, numberAdByPost) {
        const resultLi = await this.getListOfProductsByCodes(codesFormated);
        return resultLi.length === numberAdByPost;
    }

    formatCodesForSearch(codes) {
        return codes.join('+');
    }

    async getProductsByCodesFormated(codesFormated, numberAdByPost) {
        let products = [];
        const $ = await this.loadHtmlCheerio(codesFormated);
        const itensLi = await this.getListOfProductsByHtmlLoaded($);
        if(itensLi.length === numberAdByPost) {
            const itensImg = $('li.g-item > a > img');
            const itensTitleAndHref = $('li.g-item > div > a');
            const itensPrice = $('li.g-item > div > p > strong');
            const indexs = this.createIndexForValidation(itensLi.length);
            indexs.forEach(index => {
                const title = itensTitleAndHref[index].attribs['title'];
                const link = `${ENDPOINTS.parceiroMagulu.base}${itensTitleAndHref[index].attribs['href']}`;
                const code = itensLi[index].attribs['data-productid'];
                const imgLink = itensImg[index].attribs['data-original'].replace('160x160', this.imgSize);
                const price = itensPrice[index].children.filter(item => item.type === 'text')[0].data;
                products.push({title, code, imgLink, price, link});
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
                const itensImg = $('li.g-item > a > img');
                const itensTitleAndHref = $('li.g-item > div > a');
                const itensPrice = $('li.g-item > div > p > strong');
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