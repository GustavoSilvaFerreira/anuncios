/**
 * VideoQueue - Gerencia fila de processamento de vídeos com retry automático
 * Processa vídeos sequencialmente ou com limite de concorrência
 */

class VideoQueue {
    constructor(videoService, maxConcurrent = 1) {
        this.videoService = videoService;
        this.maxConcurrent = maxConcurrent;
        this.queue = [];
        this.processing = 0;
        this.stats = {
            total: 0,
            completed: 0,
            failed: 0,
            retried: 0,
            startTime: null,
            endTime: null
        };
    }

    /**
     * Adiciona vídeo à fila para processamento
     * @param {Object} post - Dados do post/anúncio
     * @param {String} outputPath - Caminho de saída do vídeo
     * @param {Object} options - {maxRetries: 3, onProgress, onError}
     */
    addTask(post, outputPath, options = {}) {
        const {
            maxRetries = 3,
            onProgress = () => {},
            onError = () => {}
        } = options;

        const task = {
            id: Math.random().toString(36).substr(2, 9),
            post,
            outputPath,
            maxRetries,
            attempts: 0,
            onProgress,
            onError,
            status: 'pending', // pending, processing, completed, failed
            error: null,
            startTime: null,
            endTime: null
        };

        this.queue.push(task);
        this.stats.total++;
        return task.id;
    }

    /**
     * Inicia processamento da fila
     */
    async process() {
        this.stats.startTime = Date.now();
        console.log(`[VideoQueue] Iniciando fila com ${this.queue.length} vídeos (max concorrência: ${this.maxConcurrent})`);

        const promises = [];

        // Iniciar workers baseado em maxConcurrent
        for (let i = 0; i < this.maxConcurrent; i++) {
            promises.push(this._processWorker());
        }

        await Promise.all(promises);
        this.stats.endTime = Date.now();

        // Log final
        const duration = ((this.stats.endTime - this.stats.startTime) / 1000).toFixed(2);
        console.log(`[VideoQueue] Fila concluída em ${duration}s`);
        console.log(`[VideoQueue] Resumo: ${this.stats.completed} sucesso, ${this.stats.failed} falhas, ${this.stats.retried} retries`);

        return {
            success: this.stats.failed === 0,
            stats: {
                ...this.stats,
                duration: `${duration}s`
            },
            results: this.queue.map(t => ({
                id: t.id,
                status: t.status,
                attempts: t.attempts,
                error: t.error,
                duration: t.endTime ? t.endTime - t.startTime : null
            }))
        };
    }

    /**
     * Worker que processa tarefas da fila
     */
    async _processWorker() {
        while (this.queue.length > 0) {
            const task = this.queue.shift();
            if (!task) break;

            await this._executeTask(task);
        }
    }

    /**
     * Executa uma tarefa com retry automático
     */
    async _executeTask(task) {
        const { id, post, outputPath, maxRetries, onProgress, onError } = task;

        while (task.attempts < maxRetries) {
            task.attempts++;
            task.status = 'processing';
            task.startTime = Date.now();

            try {
                console.log(`[VideoQueue] Processando ${id} (${this.stats.completed + this.stats.failed + 1}/${this.stats.total}) - Tentativa ${task.attempts}/${maxRetries}`);
                
                const result = await this.videoService.createVideo(post, outputPath);
                
                task.status = 'completed';
                task.endTime = Date.now();
                this.stats.completed++;

                console.log(`[VideoQueue] ✓ ${id} criado com sucesso (${((task.endTime - task.startTime) / 1000).toFixed(2)}s)`);
                onProgress?.({ status: 'completed', taskId: id, result });
                break;

            } catch (error) {
                task.error = error.message;
                task.endTime = Date.now();

                if (task.attempts < maxRetries) {
                    // Retry com backoff exponencial
                    const delay = Math.pow(2, task.attempts - 1) * 1000;
                    console.log(`[VideoQueue] ✗ ${id} falhou na tentativa ${task.attempts}. Aguardando ${delay}ms antes de retry...`);
                    console.log(`[VideoQueue] Erro: ${error.message}`);

                    this.stats.retried++;
                    onError?.({ status: 'retrying', taskId: id, attempt: task.attempts, error, nextRetryIn: delay });

                    await this._delay(delay);
                } else {
                    // Máximo de tentativas alcançado
                    task.status = 'failed';
                    this.stats.failed++;

                    console.log(`[VideoQueue] ✗ ${id} falhou após ${task.attempts} tentativas`);
                    console.log(`[VideoQueue] Erro final: ${error.message}`);

                    onError?.({ status: 'failed', taskId: id, attempt: task.attempts, error });
                    break;
                }
            }
        }
    }

    /**
     * Utilitário para delay
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Retorna estatísticas da fila
     */
    getStats() {
        return {
            ...this.stats,
            pending: this.queue.length,
            duration: this.stats.endTime ? 
                ((this.stats.endTime - this.stats.startTime) / 1000).toFixed(2) + 's' : 
                'em progresso'
        };
    }

    /**
     * Limpa a fila
     */
    clear() {
        this.queue = [];
        this.stats = {
            total: 0,
            completed: 0,
            failed: 0,
            retried: 0,
            startTime: null,
            endTime: null
        };
    }
}

module.exports = VideoQueue;
