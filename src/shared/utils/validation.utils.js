/**
 * Validation Utilities
 * Funções reutilizáveis de validação
 * Encontradas em: ad.controller.js, magazine-luiza.service.js
 */

const StringUtils = require('./string.utils');
const ArrayUtils = require('./array.utils');

class ValidationUtils {
  /**
   * Valida se string de códigos tem quantidade esperada
   * Encontrado em: ad.controller.js, magazine-luiza.service.js
   */
  static validateThreeCodesForCreate(codesString, numberAdByPost = 3) {
    return StringUtils.splitBySeparator(codesString, '+').length === numberAdByPost;
  }

  /**
   * Verifica se quantidade de códigos é válida
   */
  static validateCodeCount(codesString, expectedCount) {
    const codes = ArrayUtils.filter(StringUtils.splitBySeparator(codesString, '+'), c => StringUtils.trim(c));
    return codes.length === expectedCount;
  }

  /**
   * Valida URL
   */
  static validateUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Valida email
   */
  static validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Valida se valor está dentro de range
   */
  static validateRange(value, min, max) {
    return value >= min && value <= max;
  }

  /**
   * Valida se array não está vazio e tem tipo correto
   */
  static validateArray(value) {
    return Array.isArray(value) && value.length > 0;
  }

  /**
   * Valida se objeto tem todas as propriedades obrigatórias
   */
  static validateRequiredProperties(obj, requiredProps) {
    return requiredProps.every(prop => obj.hasOwnProperty(prop) && obj[prop] != null);
  }

  /**
   * Valida se string tem comprimento mínimo
   */
  static validateMinLength(str, minLength) {
    return str && str.toString().length >= minLength;
  }

  /**
   * Valida se string tem comprimento máximo
   */
  static validateMaxLength(str, maxLength) {
    return !str || str.toString().length <= maxLength;
  }

  /**
   * Valida se arquivo existe (para paths de imagem)
   */
  static validateFileExists(filePath) {
    try {
      const fs = require('fs');
      return fs.existsSync(filePath);
    } catch {
      return false;
    }
  }

  /**
   * Valida extensão de arquivo
   */
  static validateFileExtension(filePath, allowedExtensions) {
    const ext = StringUtils.getExtension(filePath).toLowerCase();
    return allowedExtensions.includes(ext);
  }

  /**
   * Valida se string contém apenas números
   */
  static validateNumeric(str) {
    return /^\d+$/.test(str);
  }

  /**
   * Valida formato de data (YYYY-MM-DD)
   */
  static validateDateFormat(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  /**
   * Valida se preço está em formato brasileiro
   */
  static validatePrice(priceText) {
    const regex = /^R\$\s*\d{1,3}(?:\.\d{3})*(?:,\d{2})?$/;
    return regex.test(priceText.trim());
  }

  /**
   * Valida se código de produto Magazine Luiza é válido
   */
  static validateProductCode(code) {
    return /^[a-zA-Z0-9]+$/.test(code) && code.length >= 6;
  }

  /**
   * Valida se objeto de produto está completo
   */
  static validateProduct(product) {
    const requiredProps = ['title', 'code', 'price', 'imgLink', 'link'];
    return this.validateRequiredProperties(product, requiredProps) &&
           this.validateProductCode(product.code) &&
           this.validateUrl(product.imgLink) &&
           this.validateUrl(product.link);
  }
}

module.exports = ValidationUtils;