/**
 * URL Utilities
 * Funções reutilizáveis de manipulação de URLs
 * Encontradas em: ad.controller.js
 */

const StringUtils = require('./string.utils');
const ArrayUtils = require('./array.utils');

class UrlUtils {
  /**
   * Constrói URL de busca de produtos no Magazine Luiza
   * Encontrado em: ad.controller.js (linkBaseSearchProducts)
   */
  static buildSearchProductsUrl(codes, baseSearchUrl) {
    const codesJoined = Array.isArray(codes) ? StringUtils.join(codes, '+') : codes;
    return `${baseSearchUrl}/${codesJoined}/`;
  }

  /**
   * Extrai código de produto da URL
   * Padrão visto em: magazine-luiza.service.js
   */
  static extractProductCode(url) {
    const parts = StringUtils.splitBySeparator(url, '/');
    // Código geralmente está na posição 4
    return parts[4] || null;
  }

  /**
   * Normaliza tamanho de imagem em URL
   * Encontrado em: magazine-luiza.service.js
   */
  static normalizeImageSize(imageUrl, fromSize, toSize) {
    return imageUrl.replace(fromSize, toSize);
  }

  /**
   * Adiciona parâmetro à URL
   */
  static addQueryParam(url, param, value) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${param}=${encodeURIComponent(value)}`;
  }

  /**
   * Remove parâmetro da URL
   */
  static removeQueryParam(url, param) {
    const regex = new RegExp(`[?&]${param}=[^&]*`, 'g');
    return url.replace(regex, '');
  }

  /**
   * Obtém valor de parâmetro da URL
   */
  static getQueryParam(url, param) {
    const regex = new RegExp(`[?&]${param}=([^&]*)`);
    const match = url.match(regex);
    return match ? decodeURIComponent(match[1]) : null;
  }

  /**
   * Verifica se URL é válida
   */
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Junta URL com paths corretamente
   */
  static joinPath(baseUrl, ...paths) {
    let url = baseUrl;
    ArrayUtils.forEach(paths, path => {
      url = url.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
    });
    return url;
  }
}

module.exports = UrlUtils;