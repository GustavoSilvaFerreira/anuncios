const { google } = require('googleapis');
const { Logger } = require('../../../shared/utils');
const fs = require('fs');
const path = require('path');

class YouTubeOAuth2Service {
    constructor() {
        this.clientId = null;
        this.clientSecret = null;
        this.refreshToken = null;
        this.oauth2Client = null;
    }

    /**
     * Inicializa OAuth 2.0 com refresh token
     */
    async initialize() {
        try {
            // Ler credenciais dos arquivos
            this.clientId = fs.readFileSync('sensitive-data/youtube-client-id.txt', 'utf8').trim();
            this.clientSecret = fs.readFileSync('sensitive-data/youtube-client-secret.txt', 'utf8').trim();
            this.refreshToken = fs.readFileSync('sensitive-data/youtube-refresh-token.txt', 'utf8').trim();

            // Criar OAuth2 client
            this.oauth2Client = new google.auth.OAuth2(
                this.clientId,
                this.clientSecret,
                'http://localhost:3000/oauth/callback'
            );

            // Configurar refresh token
            this.oauth2Client.setCredentials({
                refresh_token: this.refreshToken
            });

            Logger.success('OAuth 2.0 client inicializado com refresh token');
            return this.oauth2Client;

        } catch (error) {
            Logger.error('Erro ao inicializar OAuth 2.0', error);
            throw error;
        }
    }

    /**
     * Obtém cliente autenticado
     */
    async getAuthenticatedClient() {
        if (!this.oauth2Client) {
            await this.initialize();
        }

        // Testar se o token está válido e refresh se necessário
        if (this.oauth2Client.isTokenExpiring()) {
            await this.oauth2Client.refreshAccessToken();
        }

        return this.oauth2Client;
    }

    /**
     * Testa autenticação
     */
    async testAuthentication() {
        try {
            const auth = await this.getAuthenticatedClient();
            const youtube = google.youtube({
                version: 'v3',
                auth: auth
            });

            // Testar listando canal
            const response = await youtube.channels.list({
                part: 'snippet',
                mine: true
            });

            if (response.data.items && response.data.items.length > 0) {
                const channel = response.data.items[0];
                Logger.success(`Autenticação OK - Canal: ${channel.snippet.title}`);
                return true;
            }

            return false;

        } catch (error) {
            Logger.error('Falha no teste de autenticação', error);
            return false;
        }
    }
}

module.exports = YouTubeOAuth2Service;
