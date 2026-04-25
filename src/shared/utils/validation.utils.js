/**
 * Validation Utilities
 * Funções reutilizáveis de validação
 * Encontradas em: ad.controller.js, magazine-luiza.service.js
 */

class ValidationUtils {
  /**
   * Valida se string de códigos tem quantidade esperada
   * Encontrado em: ad.controller.js, magazine-luiza.service.js
   */
  static validateThreeCodesForCreate(codesString, numberAdByPost = 3) {
    return codesString.split('+').length === numberAdByPost;
  }

  /**
   * Verifica se quantidade de códigos é válida
   */
  static validateCodeCount(codesString, expectedCount) {
    const codes = codesString.split('+').filter(c => c.trim());
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
}

module.exports = ValidationUtils;