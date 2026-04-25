/**
 * File Utilities
 * Funções reutilizáveis de manipulação de arquivos
 * Encontradas em: ad.controller.js
 */

class FileUtils {
  /**
   * Encontra e renomeia arquivo por número em array de arquivos
   * Encontrado em: ad.controller.js (updateVideosName)
   */
  static findFileByNumber(videoNumber, videosFiltered, fileExtension = '.mp4') {
    const fileName = `${videoNumber}${fileExtension}`;
    return videosFiltered.find(item => item === fileName);
  }

  /**
   * Gera nome de arquivo com contador e extensão
   */
  static generateFileName(counter, name, extension, separator = '_') {
    const sanitizedName = name.replace(/[^a-zA-Z0-9\s-]/g, '');
    return `${counter}${separator}${sanitizedName}.${extension}`;
  }

  /**
   * Extrai informações de nome de arquivo
   */
  static parseFileName(fileName) {
    const lastDotIndex = fileName.lastIndexOf('.');
    const name = fileName.substring(0, lastDotIndex);
    const extension = fileName.substring(lastDotIndex + 1);
    return { name, extension };
  }

  /**
   * Cria nome seguro para arquivo (sem caracteres especiais)
   */
  static createSafeFileName(name, extension) {
    const sanitized = name
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();
    return `${sanitized}.${extension}`;
  }

  /**
   * Retorna extensão de arquivo
   */
  static getFileExtension(filePath) {
    const parts = filePath.split('.');
    return parts[parts.length - 1].toLowerCase();
  }

  /**
   * Valida se extensão de arquivo é permitida
   */
  static isAllowedExtension(filePath, allowedExtensions) {
    const ext = this.getFileExtension(filePath);
    return allowedExtensions.includes(ext);
  }

  /**
   * Formata tamanho de arquivo em bytes para legível
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Gera nome único para arquivo (com timestamp/uuid)
   */
  static generateUniqueFileName(baseName, extension, useTimestamp = true) {
    const timestamp = useTimestamp ? Date.now() : Math.random().toString(36).substr(2, 9);
    return `${baseName}_${timestamp}.${extension}`;
  }
}

module.exports = FileUtils;