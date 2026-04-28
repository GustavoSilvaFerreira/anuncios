const { GoogleAuth } = require('google-auth-library');
const { Logger } = require('../../../shared/utils');
const fs = require('fs');
const path = require('path');

class YouTubeAuthService {
    constructor() {
        this.auth = null;
        this.serviceAccountKey = null;
    }

    /**
     * Inicializa Service Account para backend automatizado
     */
    async initializeServiceAccount() {
        try {
            // Para Service Account, você precisa do arquivo JSON das credenciais
            const keyPath = process.env.YOUTUBE_SERVICE_ACCOUNT_KEY || 
                          path.join(process.cwd(), 'sensitive-data', 'youtube-service-account.json');

            if (!fs.existsSync(keyPath)) {
                throw new Error(`Arquivo de Service Account não encontrado: ${keyPath}`);
            }

            const keyFile = fs.readFileSync(keyPath, 'utf8');
            this.serviceAccountKey = JSON.parse(keyFile);

            // Configurar Service Account com escopos necessários
            this.auth = new GoogleAuth({
                credentials: this.serviceAccountKey,
                scopes: [
                    'https://www.googleapis.com/auth/youtube.upload',
                    'https://www.googleapis.com/auth/youtube'
                ]
            });

            Logger.success('Service Account YouTube inicializado com sucesso');
            return this.auth;

        } catch (error) {
            Logger.error('Erro ao inicializar Service Account YouTube', error);
            throw error;
        }
    }

    /**
     * Obtém cliente autenticado para upload
     */
    async getAuthenticatedClient() {
        if (!this.auth) {
            await this.initializeServiceAccount();
        }

        return this.auth;
    }

    /**
     * Verifica se o canal está vinculado ao Service Account
     */
    async checkChannelAccess() {
        try {
            const auth = await this.getAuthenticatedClient();
            const { google } = require('googleapis');

            const youtube = google.youtube({
                version: 'v3',
                auth: auth
            });

            // Tenta listar vídeos do canal para verificar acesso
            const response = await youtube.search.list({
                part: 'snippet',
                channelId: 'YOUR_CHANNEL_ID', // Substituir pelo ID do canal
                maxResults: 1
            });

            Logger.success('Acesso ao canal verificado com Service Account');
            return true;

        } catch (error) {
            Logger.error('Service Account não tem acesso ao canal', error);
            return false;
        }
    }
}

module.exports = YouTubeAuthService;
