/**
 * Hashtag Utilities
 * Funções reutilizáveis de manipulação de hashtags
 * Encontradas em: ad.controller.js
 */

const ArrayUtils = require('./array.utils');
const StringUtils = require('./string.utils');

class HashtagUtils {
  /**
   * Normaliza array de strings para hashtags
   * Encontrado em: ad.controller.js
   * Ex: ['promo', '#venda'] -> ['#promo', '#venda']
   */
  static normalizeHashtags(hashtags) {
    return ArrayUtils.map(hashtags, hashtag => 
      hashtag.indexOf('#') > -1 ? hashtag : `#${hashtag}`
    );
  }

  /**
   * Junta array de hashtags em string com espaço
   */
  static joinHashtags(hashtags) {
    const normalized = this.normalizeHashtags(hashtags);
    return StringUtils.join(normalized, ' ');
  }

  /**
   * Divide string de hashtags em array
   */
  static splitHashtags(hashtagString) {
    return ArrayUtils.filter(StringUtils.splitBySeparator(hashtagString, /\s+/), h => h.length > 0);
  }

  /**
   * Remove hashtag duplicadas mantendo ordem
   */
  static removeDuplicates(hashtags) {
    const normalized = this.normalizeHashtags(hashtags);
    return ArrayUtils.removeDuplicates(normalized);
  }

  /**
   * Valida se string é hashtag válida
   */
  static isValidHashtag(str) {
    return /^#[a-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑa-zA-Z0-9_]+$/.test(str);
  }

  /**
   * Limita quantidade de hashtags
   */
  static limitHashtags(hashtags, limit = 30) {
    return this.normalizeHashtags(hashtags).slice(0, limit);
  }

  /**
   * Formata hashtags para redes sociais específicas
   */
  static formatForPlatform(hashtags, platform = 'default') {
    const normalized = this.normalizeHashtags(hashtags);
    
    switch(platform.toLowerCase()) {
      case 'twitter':
        return StringUtils.join(normalized.slice(0, 10), ' '); // Limite recomendado
      case 'tiktok':
        return StringUtils.join(normalized.slice(0, 20), ' ');
      case 'instagram':
        return StringUtils.join(normalized.slice(0, 30), ' ');
      default:
        return StringUtils.join(normalized, ' ');
    }
  }
}

module.exports = HashtagUtils;