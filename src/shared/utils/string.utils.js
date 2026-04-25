/**
 * String Utilities
 * Funções reutilizáveis de manipulação de strings
 * Encontradas em: ad.controller.js, magazine-luiza.service.js, video.service.js
 */

class StringUtils {
  /**
   * Extrai extensão de arquivo/URL
   * Encontrado em: ad.controller.js
   */
  static getExtension(filePath) {
    const parts = filePath.split('.');
    return parts[parts.length - 1];
  }

  /**
   * Remove caracteres especiais perigosos para FFmpeg
   * Regex: encontrado em video.service.js
   */
  static sanitizeAdsCharacter(text) {
    const regex = /([\u0300-\u036f]|[^0-9a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\#\ \$\*\(\)\=\/\;\.\,\-\_\\])/g;
    return text.replace(regex, '');
  }

  /**
   * Limpa especificamente caracteres especiais de objetos ads
   * Encontrado em: video.service.js
   */
  static sanitizeAdsObject(ads) {
    const regex = /([\u0300-\u036f]|[^0-9a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\#\ \$\*\(\)\=\/\;\.\,\-\_\\])/g;
    for (const item of ads) {
      Object.keys(item).forEach(key => {
        if (key === 'title' || key === 'code' || key === 'price') {
          item[key] = item[key].replace(regex, '');
        }
      });
    }
    return ads;
  }

  /**
   * Formata preço do Magazine Luiza
   * Remove "ou " e faz trim
   * Encontrado em: magazine-luiza.service.js
   */
  static formatPrice(priceText) {
    return priceText.replace('ou ', '').trim();
  }

  /**
   * Junta array de códigos com '+'
   * Encontrado em: magazine-luiza.service.js
   */
  static formatCodesForSearch(codes) {
    return codes.join('+');
  }

  /**
   * Remove caracteres especiais de códigos (slashes)
   * Encontrado em: ad.controller.js
   */
  static formatCodesRemoveSlash(codes) {
    return codes.replace(/\//g, '');
  }

  /**
   * Garante que string termina com caractere
   */
  static ensureEndsWith(str, char) {
    return str.endsWith(char) ? str : str + char;
  }

  /**
   * Remove espaços extras e normaliza
   */
  static normalizeSpaces(str) {
    return str.replace(/\s+/g, ' ').trim();
  }
}

module.exports = StringUtils;