/**
 * Text Formatting Utilities
 * Funções reutilizáveis de formatação de texto
 * Encontradas em: ad.controller.js, video.service.js
 */

const StringUtils = require('./string.utils');
const ArrayUtils = require('./array.utils');

class TextFormatter {
  /**
   * Formata texto para descrição de post
   * Cria quebras de linha e pré-processa
   */
  static formatPostDescription(title, url, hashtags, socialMedia = 'default') {
    const baseText = `${title}\nLink: ${url}\n\n${hashtags}`;
    
    switch(socialMedia.toLowerCase()) {
      case 'youtube':
        return this.formatYoutubeDescription(title, url, hashtags);
      case 'tiktok':
        return this.formatTiktokDescription(title, hashtags);
      case 'instagram':
      case 'meta':
        return this.formatInstagramDescription(title, url, hashtags);
      default:
        return baseText;
    }
  }

  /**
   * Formato específico para YouTube
   */
  static formatYoutubeDescription(title, url, hashtags) {
    const titleFormatted = `${title} #shorts da @wedconecta\n\n`;
    let description = `Link para os produtos: ${url}\n\n`;
    description += `Siga nossas redes sociais:\n`;
    description += `Instagram: https://www.instagram.com/wedconecta\n`;
    description += `Facebook: https://www.facebook.com/wedconecta\n`;
    description += `TikTok: https://www.tiktok.com/@wedconecta\n\n`;
    description += `#shorts da @wedconecta\n`;
    description += `#achadinhos #achados #parceiromagalu #wedconecta #promoção #promo #promotion #ofertas ${hashtags}\n`;

    return { title: titleFormatted, description: description.trim() };
  }

  /**
   * Formato específico para TikTok
   */
  static formatTiktokDescription(title, hashtags) {
    return `${title} - Link na BIO #parceiromagalu #achadinhos #promo #promotion #sale ${hashtags}`;
  }

  /**
   * Formato específico para Instagram/Meta
   */
  static formatInstagramDescription(title, url, hashtags) {
    let description = `${title}\nLink da loja na BIO\n\n`;
    description += `Siga nossas redes sociais:\n`;
    description += `YouTube: https://www.youtube.com/@wedconecta\n`;
    description += `TikTok: https://www.tiktok.com/@wedconecta\n`;
    description += `Instagram: https://www.instagram.com/wedconecta\n`;
    description += `Facebook: https://www.facebook.com/wedconecta\n\n`;

    description += `#achadinhos #achados #parceiromagalu #wedconecta #promoção #promo #promotion #ofertas ${hashtags}`;

    return description;
  }

  /**
   * Cria separador visual
   */
  static createSeparator(char = '*', width = 60) {
    return char.repeat(width);
  }

  /**
   * Centraliza texto em linha
   */
  static centerText(text, width = 60) {
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(padding) + text;
  }

  /**
   * Capitaliza primeira letra
   */
  static capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Capitaliza cada palavra
   */
  static titleCase(str) {
    return StringUtils.join(
      ArrayUtils.map(StringUtils.splitBySeparator(str.toLowerCase(), ' '), word => this.capitalize(word)),
      ' '
    );
  }

  /**
   * Trunca texto com elipsis
   */
  static truncate(str, maxLength = 100) {
    return str.length > maxLength ? str.substring(0, maxLength - 3) + '...' : str;
  }

  /**
   * Remove quebras de linha extras
   */
  static normalizeLineBreaks(str) {
    return str.replace(/\n{3,}/g, '\n\n');
  }

  /**
   * Formata dias para string legível
   * Ex: 5 -> "05"
   */
  static padNumber(num, length = 2) {
    return StringUtils.padNumber(num, length);
  }

  /**
   * Formata título para vídeo (com validação de caracteres)
   */
  static formatVideoTitle(title, maxLength = 100) {
    const sanitized = StringUtils.sanitizeAdsCharacter(title);
    return this.truncate(sanitized, maxLength);
  }

  /**
   * Formata descrição para redes sociais específicas
   */
  static formatSocialMediaDescription(title, url, hashtags, platform = 'default') {
    const cleanTitle = this.formatVideoTitle(title);
    const hashtagString = Array.isArray(hashtags) ? StringUtils.join(hashtags, ' ') : hashtags;
    
    switch(platform.toLowerCase()) {
      case 'youtube':
        return this.formatYoutubeDescription(cleanTitle, url, hashtagString);
      case 'tiktok':
        return this.formatTiktokDescription(cleanTitle, hashtagString);
      case 'instagram':
        return this.formatInstagramDescription(cleanTitle, url, hashtagString);
      default:
        return this.formatPostDescription(cleanTitle, url, hashtagString);
    }
  }
}

module.exports = TextFormatter;