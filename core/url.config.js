const BASE_URL_PARCEIRO_MAGALU = process.env.BASE_URL_PARCEIRO_MAGALU;
const PATH_WED_CONECTA = process.env.PATH_WED_CONECTA;

const ENDPOINTS = Object.freeze({
    parceiroMagulu: {
        base: BASE_URL_PARCEIRO_MAGALU
    },
    wedConecta: {
        search: `${BASE_URL_PARCEIRO_MAGALU}${PATH_WED_CONECTA}/busca`
    }
});

module.exports = ENDPOINTS;