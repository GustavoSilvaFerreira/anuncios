/**
 * File Utilities
 * Funções reutilizáveis de manipulação de arquivos
 * Encontradas em: ad.controller.js, video.service.js
 */

const StringUtils = require('./string.utils');
const ArrayUtils = require('./array.utils');

class FileUtils {
  /**
   * Encontra e renomeia arquivo por número em array de arquivos
   * Encontrado em: ad.controller.js (updateVideosName)
   */
  static findFileByNumber(videoNumber, videosFiltered, fileExtension = '.mp4') {
    const fileName = `${videoNumber}${fileExtension}`;
    return ArrayUtils.findOrNull(videosFiltered, item => item === fileName);
  }

  /**
   * Gera nome de arquivo com contador e extensão
   */
  static generateFileName(counter, name, extension, separator = '_') {
    const sanitizedName = StringUtils.sanitizeAdsCharacter(name).replace(/\s+/g, ' ');
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
    return StringUtils.getExtension(filePath);
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

  /**
   * Verifica se arquivo existe (wrapper para File.service)
   */
  static existsSync(filePath) {
    const File = require('../../modules/storage/services/file.service');
    return File.existsSync(filePath);
  }

  /**
   * Cria diretório (wrapper para File.service)
   */
  static async mkdir(dirPath) {
    const File = require('../../modules/storage/services/file.service');
    return File.mkdir(dirPath);
  }

  /**
   * Escreve arquivo (wrapper para File.service)
   */
  static async writeFile(filePath, content) {
    const File = require('../../modules/storage/services/file.service');
    return File.writeFile(filePath, content);
  }

  /**
   * Renomeia arquivo (wrapper para File.service)
   */
  static rename(oldPath, newPath) {
    const File = require('../../modules/storage/services/file.service');
    return File.rename(oldPath, newPath);
  }

  /**
   * Lê arquivo como array de strings (wrapper para File.service)
   */
  static async txtForArrayString(filePath) {
    const File = require('../../modules/storage/services/file.service');
    return File.txtForArrayString(filePath);
  }
}

module.exports = FileUtils;