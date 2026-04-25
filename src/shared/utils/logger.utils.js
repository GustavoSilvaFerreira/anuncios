/**
 * Logger Utilities
 * Sistema consistente de logging
 * Encontrados em: ad.controller.js, video.service.js, video-queue.service.js
 */

class Logger {
  static PREFIX = {
    INFO: '[INFO]',
    ERROR: '[ERROR]',
    SUCCESS: '[✓]',
    WARNING: '[⚠]',
    DEBUG: '[DEBUG]',
    VIDEO: '[VideoService]',
    QUEUE: '[VideoQueue]'
  };

  /**
   * Log de informação
   */
  static info(message, data = null) {
    const msg = `${this.PREFIX.INFO} ${message}`;
    console.log(msg);
    if (data) console.log(data);
  }

  /**
   * Log de erro
   */
  static error(message, error = null) {
    const msg = `${this.PREFIX.ERROR} ${message}`;
    console.error(msg);
    if (error) console.error(error);
  }

  /**
   * Log de sucesso
   */
  static success(message) {
    console.log(`${this.PREFIX.SUCCESS} ${message}`);
  }

  /**
   * Log de aviso
   */
  static warn(message, data = null) {
    const msg = `${this.PREFIX.WARNING} ${message}`;
    console.warn(msg);
    if (data) console.warn(data);
  }

  /**
   * Log de debug (apenas se enabled)
   */
  static debug(message, data = null, enabled = false) {
    if (!enabled) return;
    const msg = `${this.PREFIX.DEBUG} ${message}`;
    console.log(msg);
    if (data) console.log(data);
  }

  /**
   * Log de seção com separador
   */
  static section(title, width = 60) {
    console.log(`\n${'='.repeat(width)}`);
    console.log(title);
    console.log(`${'='.repeat(width)}\n`);
  }

  /**
   * Log de estatísticas
   */
  static stats(title, stats) {
    console.log(`\n${title}:`);
    Object.entries(stats).forEach(([key, value]) => {
      console.log(`  - ${key}: ${value}`);
    });
  }

  /**
   * Log com timestamp
   */
  static withTimestamp(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const levelPrefix = this.PREFIX[level.toUpperCase()] || this.PREFIX.INFO;
    console.log(`[${timestamp}] ${levelPrefix} ${message}`);
  }

  /**
   * Agrupa logs relacionados
   */
  static group(title, callback) {
    console.group(title);
    try {
      callback();
    } finally {
      console.groupEnd();
    }
  }
}

module.exports = Logger;