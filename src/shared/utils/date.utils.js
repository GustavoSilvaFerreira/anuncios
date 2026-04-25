/**
 * Date Utilities
 * Funções reutilizáveis de manipulação de datas
 * Encontradas em: ad.controller.js
 */

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
    const [year, month, day] = dateString.split('-');
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
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
}

module.exports = DateUtils;