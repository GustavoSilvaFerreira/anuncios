const { google } = require('googleapis');
const { Logger } = require('../../../shared/utils');
const fs = require('fs');
const path = require('path');

class YouTubeOAuthService {
    constructor() {
        this.clientId = null;
        this.clientSecret = null;
        this.refreshToken = null;
        this.authClient = null;
    }

    /**
     * Inicializa OAuth 2.0 com Refresh Token (ideal para backend)
     */
    async initializeWithRefreshToken() {
        try {
            // Carregar credenciais dos arquivos
            const clientIdPath = path.join(process.cwd(), 'sensitive-data', 'youtube-client-id.txt');
            const clientSecretPath = path.join(process.cwd(), 'sensitive-data', 'youtube-client-secret.txt');
            const refreshTokenPath = path.join(process.cwd(), 'sensitive-data', 'youtube-refresh-token.txt');

            if (!fs.existsSync(clientIdPath)) {
                throw new Error(`Client ID não encontrado: ${clientIdPath}`);
            }
            if (!fs.existsSync(clientSecretPath)) {
                throw new Error(`Client Secret não encontrado: ${clientSecretPath}`);
            }
            if (!fs.existsSync(refreshTokenPath)) {
                throw new Error(`Refresh token não encontrado: ${refreshTokenPath}`);
            }

            this.clientId = fs.readFileSync(clientIdPath, 'utf8').trim();
            this.clientSecret = fs.readFileSync(clientSecretPath, 'utf8').trim();
            this.refreshToken = fs.readFileSync(refreshTokenPath, 'utf8').trim();
            
            // Configurar OAuth 2.0 client com google.auth.OAuth2
            this.authClient = new google.auth.OAuth2(
                this.clientId,
                this.clientSecret,
                'http://localhost:3000/oauth/callback' // Callback URL (não usado com refresh token)
            );

            // Configurar refresh token
            this.authClient.setCredentials({
                refresh_token: this.refreshToken
            });

            Logger.success('OAuth 2.0 com Refresh Token inicializado');
            return this.authClient;

        } catch (error) {
            Logger.error('Erro ao inicializar OAuth 2.0', error);
            throw error;
        }
    }

    /**
     * Gera URL para obter refresh token (setup único)
     */
    generateAuthUrl() {
        const { google } = require('googleapis');
        
        const oauth2Client = new google.auth.OAuth2(
            process.env.YOUTUBE_CLIENT_ID,
            process.env.YOUTUBE_CLIENT_SECRET,
            'http://localhost:3000/oauth/callback' // Callback para setup
        );

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline', // Importante para refresh token
            scope: [
                'https://www.googleapis.com/auth/youtube.upload',
                'https://www.googleapis.com/auth/youtube'
            ],
            prompt: 'consent' // Força mostrar consentimento
        });

        return authUrl;
    }

    /**
     * Troca código de autorização por refresh token
     */
    async exchangeCodeForTokens(code) {
        try {
            const { google } = require('googleapis');
            
            const oauth2Client = new google.auth.OAuth2(
                process.env.YOUTUBE_CLIENT_ID,
                process.env.YOUTUBE_CLIENT_SECRET,
                'http://localhost:3000/oauth/callback'
            );

            const { tokens } = await oauth2Client.getToken(code);
            
            // Salvar refresh token
            const refreshTokenPath = path.join(process.cwd(), 'sensitive-data', 'youtube-refresh-token.txt');
            fs.writeFileSync(refreshTokenPath, tokens.refresh_token);

            Logger.success('Refresh token obtido e salvo com sucesso');
            return tokens;

        } catch (error) {
            Logger.error('Erro ao trocar código por tokens', error);
            throw error;
        }
    }

    /**
     * Obtém cliente autenticado para upload
     */
    async getAuthenticatedClient() {
        if (!this.authClient) {
            await this.initializeWithRefreshToken();
        }

        // Verificar se o token precisa ser atualizado
        if (this.authClient.isTokenExpiring()) {
            const newCredentials = await this.authClient.refreshAccessToken();
            this.authClient.setCredentials(newCredentials);
        }

        return this.authClient;
    }

    /**
     * Testa se o refresh token funciona
     */
    async testAuthentication() {
        try {
            const auth = await this.getAuthenticatedClient();
            const { google } = require('googleapis');

            const youtube = google.youtube({
                version: 'v3',
                auth: auth
            });

            // Testa listando o próprio canal
            const response = await youtube.channels.list({
                part: 'snippet',
                mine: true
            });

            Logger.success('Autenticação OAuth 2.0 funcionando');
            return response.data.items[0];

        } catch (error) {
            Logger.error('Falha na autenticação OAuth 2.0', error);
            return false;
        }
    }
}

module.exports = YouTubeOAuthService;
