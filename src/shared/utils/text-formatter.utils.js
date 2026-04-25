/**
 * Text Formatting Utilities
 * Funções reutilizáveis de formatação de texto
 * Encontradas em: ad.controller.js, video.service.js
 */

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
    return `${title} #shorts\n\n` +
           `Link: ${url}\n\n` +
           `Siga nossas redes:\n` +
           `Instagram: https://instagram.com/wedconecta\n` +
           `TikTok: https://tiktok.com/@wedconecta\n` +
           `Facebook: https://facebook.com/wedconecta\n\n` +
           `${hashtags}`;
  }

  /**
   * Formato específico para TikTok
   */
  static formatTiktokDescription(title, hashtags) {
    return `${title}\nLink na BIO\n\n${hashtags}`;
  }

  /**
   * Formato específico para Instagram
   */
  static formatInstagramDescription(title, url, hashtags) {
    return `${title}\nLink na BIO\n\n${hashtags}`;
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
    return str
      .toLowerCase()
      .split(' ')
      .map(word => this.capitalize(word))
      .join(' ');
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
    return String(num).padStart(length, '0');
  }
}

module.exports = TextFormatter;