/**
 * Date Utilities
 * Funções reutilizáveis de manipulação de datas
 * Encontradas em: ad.controller.js
 */

const StringUtils = require('./string.utils');
const ArrayUtils = require('./array.utils');

class DateUtils {
  /**
   * Retorna nova data adicionando dias
   */
  static getDatePlusDay(date, days) {
    date.setDate(date.getDate() + days);
    return this.getDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }

  /**
   * Cria nova instância de Date com base em year, month, day
   */
  static getDate(year, month, day) {
    return new Date(year, month - 1, day);
  }

  /**
   * Formata data para string no padrão YYYY-MM-DD
   */
  static getDateFormated(date) {
    const monthFormated = date.getMonth() >= 9 
      ? date.getMonth() + 1 
      : `0${date.getMonth() + 1}`;
    
    const dayFormated = date.getDate() < 10 
      ? `0${date.getDate()}` 
      : date.getDate();
    
    return `${date.getFullYear()}-${monthFormated}-${dayFormated}`;
  }

  /**
   * Extrai componentes de data formatada (YYYY-MM-DD)
   */
  static parseDateFormated(dateString) {
    const [year, month, day] = StringUtils.splitBySeparator(dateString, '-');
    return {
      year: Number(year),
      month: Number(month),
      day: Number(day)
    };
  }

  /**
   * Retorna data formatada com padding de zeros
   */
  static getDateFormatedPadded(date) {
    const year = date.getFullYear();
    const month = StringUtils.padNumber(date.getMonth() + 1, 2);
    const day = StringUtils.padNumber(date.getDate(), 2);
    
    return `${year}-${month}-${day}`;
  }

  /**
   * Valida se string está em formato de data válido
   */
  static isValidDateFormat(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  /**
   * Converte string de data para objeto Date
   */
  static parseDate(dateString) {
    if (!this.isValidDateFormat(dateString)) {
      throw new Error(`Formato de data inválido: ${dateString}`);
    }
    
    const { year, month, day } = this.parseDateFormated(dateString);
    return this.getDate(year, month, day);
  }

  /**
   * Adiciona dias úteis (ignorando fins de semana)
   */
  static addBusinessDays(date, days) {
    let result = new Date(date);
    let businessDaysAdded = 0;
    
    while (businessDaysAdded < days) {
      result.setDate(result.getDate() + 1);
      
      // 0 = Domingo, 6 = Sábado
      if (result.getDay() !== 0 && result.getDay() !== 6) {
        businessDaysAdded++;
      }
    }
    
    return result;
  }

  /**
   * Verifica se data é fim de semana
   */
  static isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6; // Domingo ou Sábado
  }

  /**
   * Formata data para exibição em português (DD/MM/YYYY)
   */
  static formatDatePT(date) {
    const day = StringUtils.padNumber(date.getDate(), 2);
    const month = StringUtils.padNumber(date.getMonth() + 1, 2);
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  }
}

module.exports = DateUtils;