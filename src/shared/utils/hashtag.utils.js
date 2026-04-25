/**
 * Hashtag Utilities
 * Funções reutilizáveis de manipulação de hashtags
 * Encontradas em: ad.controller.js
 */

class HashtagUtils {
  /**
   * Normaliza array de strings para hashtags
   * Encontrado em: ad.controller.js
   * Ex: ['promo', '#venda'] -> ['#promo', '#venda']
   */
  static normalizeHashtags(hashtags) {
    return hashtags.map(hashtag => 
      hashtag.indexOf('#') > -1 ? hashtag : `#${hashtag}`
    );
  }

  /**
   * Junta array de hashtags em string com espaço
   */
  static joinHashtags(hashtags) {
    const normalized = this.normalizeHashtags(hashtags);
    return normalized.join(' ');
  }

  /**
   * Divide string de hashtags em array
   */
  static splitHashtags(hashtagString) {
    return hashtagString.split(/\s+/).filter(h => h.length > 0);
  }

  /**
   * Remove hashtag duplicadas mantendo ordem
   */
  static removeDuplicates(hashtags) {
    const normalized = this.normalizeHashtags(hashtags);
    return [...new Set(normalized)];
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
        return normalized.slice(0, 10).join(' '); // Limite recomendado
      case 'tiktok':
        return normalized.slice(0, 20).join(' ');
      case 'instagram':
        return normalized.slice(0, 30).join(' ');
      default:
        return normalized.join(' ');
    }
  }
}

module.exports = HashtagUtils;