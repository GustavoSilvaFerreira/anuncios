#!/usr/bin/env node

/**
 * Script para setup OAuth 2.0 com Refresh Token
 * Execute: node scripts/setup-youtube-oauth.js
 */

const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { Logger } = require('../src/shared/utils');

class OAuthSetup {
    constructor() {
        this.clientId = process.env.YOUTUBE_CLIENT_ID;
        this.clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
        this.port = 3000;
    }

    async setup() {
        if (!this.clientId || !this.clientSecret) {
            console.error('❌ Configure YOUTUBE_CLIENT_ID e YOUTUBE_CLIENT_SECRET no .env');
            process.exit(1);
        }

        console.log('🔧 SETUP OAUTH 2.0 PARA YOUTUBE (Backend)\n');

        // Criar OAuth client
        const oauth2Client = new google.auth.OAuth2(
            this.clientId,
            this.clientSecret,
            `http://localhost:${this.port}/oauth/callback`
        );

        // Gerar URL de autorização
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/youtube.upload',
                'https://www.googleapis.com/auth/youtube'
            ],
            prompt: 'consent'
        });

        console.log('📋 PASSOS:\n');
        console.log('1. Abra esta URL no navegador:');
        console.log(`   ${authUrl}\n`);
        console.log('2. Faça login com sua conta Google');
        console.log('3. Conceda permissão para upload de vídeos');
        console.log('4. Você será redirecionado para localhost');
        console.log('5. O script capturará o código automaticamente\n');

        // Criar servidor HTTP para capturar callback
        await this.startCallbackServer(oauth2Client);
    }

    async startCallbackServer(oauth2Client) {
        return new Promise((resolve, reject) => {
            const server = http.createServer(async (req, res) => {
                const parsedUrl = url.parse(req.url, true);
                
                if (parsedUrl.pathname === '/oauth/callback') {
                    const code = parsedUrl.query.code;
                    
                    if (code) {
                        try {
                            // Trocar código por tokens
                            const { tokens } = await oauth2Client.getToken(code);
                            
                            // Salvar refresh token
                            const sensitiveDir = path.join(process.cwd(), 'sensitive-data');
                            if (!fs.existsSync(sensitiveDir)) {
                                fs.mkdirSync(sensitiveDir, { recursive: true });
                            }
                            
                            const refreshTokenPath = path.join(sensitiveDir, 'youtube-refresh-token.txt');
                            fs.writeFileSync(refreshTokenPath, tokens.refresh_token);
                            
                            console.log('\n✅ SUCESSO! Refresh token salvo em:');
                            console.log(`   ${refreshTokenPath}\n`);
                            
                            // Testar autenticação
                            await this.testAuthentication(oauth2Client);
                            
                            // Responder ao navegador
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            res.end(`
                                <html>
                                    <body style="font-family: Arial, sans-serif; padding: 20px;">
                                        <h2>✅ OAuth 2.0 Configurado com Sucesso!</h2>
                                        <p>Refresh token obtido e salvo.</p>
                                        <p>Você pode fechar esta janela e executar 'npm start'.</p>
                                        <script>setTimeout(() => window.close(), 3000);</script>
                                    </body>
                                </html>
                            `);
                            
                            server.close();
                            resolve(tokens);
                            
                        } catch (error) {
                            console.error('❌ Erro ao obter tokens:', error);
                            res.writeHead(500, { 'Content-Type': 'text/html' });
                            res.end('<h2>❌ Erro ao obter tokens</h2>');
                            server.close();
                            reject(error);
                        }
                    } else {
                        res.writeHead(400, { 'Content-Type': 'text/html' });
                        res.end('<h2>❌ Código não encontrado</h2>');
                        server.close();
                        reject(new Error('Código não encontrado'));
                    }
                }
            });

            server.listen(this.port, () => {
                console.log(`🌐 Servidor aguardando callback em http://localhost:${this.port}`);
                console.log('⏳ Aguardando autorização...\n');
            });
        });
    }

    async testAuthentication(oauth2Client) {
        try {
            oauth2Client.setCredentials({
                refresh_token: fs.readFileSync(
                    path.join(process.cwd(), 'sensitive-data', 'youtube-refresh-token.txt'),
                    'utf8'
                ).trim()
            });

            const youtube = google.youtube({
                version: 'v3',
                auth: oauth2Client
            });

            // Testar acesso ao canal
            const response = await youtube.channels.list({
                part: 'snippet',
                mine: true
            });

            if (response.data.items && response.data.items.length > 0) {
                const channel = response.data.items[0];
                console.log(`✅ Acesso verificado ao canal: ${channel.snippet.title}`);
                console.log('🚀 Upload de vídeos funcionará corretamente!\n');
            }

        } catch (error) {
            console.error('❌ Falha no teste de autenticação:', error);
        }
    }
}

// Executar setup
if (require.main === module) {
    const setup = new OAuthSetup();
    setup.setup().catch(console.error);
}

module.exports = OAuthSetup;
