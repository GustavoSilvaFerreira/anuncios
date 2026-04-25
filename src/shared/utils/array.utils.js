/**
 * Array Utilities
 * Funções reutilizáveis de manipulação de arrays
 * Encontradas em: magazine-luiza.service.js, ad.controller.js
 */

class ArrayUtils {
  /**
   * Cria array de índices para validação
   * Encontrado em: magazine-luiza.service.js
   */
  static createIndexForValidation(number) {
    return Object.keys(new Array(number).fill(null));
  }

  /**
   * Divide array em chunks de tamanho definido
   */
  static chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Filtra e mapeia array em uma única operação
   */
  static filterMap(array, filterFn, mapFn) {
    return array.filter(filterFn).map(mapFn);
  }

  /**
   * Remove duplicatas de array
   */
  static removeDuplicates(array) {
    return [...new Set(array)];
  }

  /**
   * Agrupa array por propriedade
   */
  static groupBy(array, key) {
    return array.reduce((groups, item) => {
      const groupKey = item[key];
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(item);
      return groups;
    }, {});
  }

  /**
   * Retorna primeiro elemento que passar no teste
   */
  static findOrNull(array, predicate) {
    return array.find(predicate) || null;
  }

  /**
   * Verifica se array tem todos os elementos
   */
  static hasAll(array, items) {
    return items.every(item => array.includes(item));
  }

  /**
   * Retorna diferença entre dois arrays
   */
  static difference(array1, array2) {
    return array1.filter(item => !array2.includes(item));
  }

  /**
   * Substituto para .map() direto
   */
  static map(array, mapFn) {
    return array.map(mapFn);
  }

  /**
   * Substituto para .filter() direto
   */
  static filter(array, filterFn) {
    return array.filter(filterFn);
  }

  /**
   * Substituto para .forEach() direto
   */
  static forEach(array, forEachFn) {
    array.forEach(forEachFn);
  }

  /**
   * Substituto para .push() em loop
   */
  static pushToArray(targetArray, items) {
    if (Array.isArray(items)) {
      targetArray.push(...items);
    } else {
      targetArray.push(items);
    }
    return targetArray;
  }

  /**
   * Executa operação em array com limite
   */
  static forEachWithLimit(array, limit, callback) {
    array.forEach((item, index) => {
      if (index < limit) {
        callback(item, index);
      }
    });
  }
}

module.exports = ArrayUtils;