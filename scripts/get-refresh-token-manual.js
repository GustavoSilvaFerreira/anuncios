#!/usr/bin/env node

/**
 * Script manual para obter refresh token do YouTube
 * Execute: node scripts/get-refresh-token-manual.js
 */

const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

class ManualOAuthSetup {
    constructor() {
        // Ler diretamente dos arquivos para evitar problemas com constants
        const fs = require('fs');
        const path = require('path');
        
        try {
            this.clientId = fs.readFileSync('sensitive-data/youtube-client-id.txt', 'utf8').trim();
            this.clientSecret = fs.readFileSync('sensitive-data/youtube-client-secret.txt', 'utf8').trim();
        } catch (error) {
            this.clientId = null;
            this.clientSecret = null;
        }
    }

    async setup() {
        if (!this.clientId || !this.clientSecret) {
            console.error('❌ Configure YOUTUBE_CLIENT_ID e YOUTUBE_CLIENT_SECRET nos arquivos:');
            console.error('   - sensitive-data/youtube-client-id.txt');
            console.error('   - sensitive-data/youtube-client-secret.txt');
            process.exit(1);
        }

        console.log('🔧 OBTENDO REFRESH TOKEN DO YOUTUBE\n');

        // Criar OAuth client
        const oauth2Client = new google.auth.OAuth2(
            this.clientId,
            this.clientSecret,
            'http://localhost:3000/oauth/callback' // Para backend local
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
        console.log('1. Copie e cole esta URL no seu navegador:');
        console.log(`\n${authUrl}\n`);
        console.log('2. Faça login com sua conta Google');
        console.log('3. Conceda permissão para upload de vídeos');
        console.log('4. Você será redirecionado para localhost');
        console.log('5. O script capturará o código automaticamente\n');
        
        // Iniciar servidor HTTP para capturar callback
        await this.startCallbackServer(oauth2Client);
    }

    async startCallbackServer(oauth2Client) {
        const http = require('http');
        const url = require('url');
        
        return new Promise((resolve, reject) => {
            const server = http.createServer(async (req, res) => {
                const parsedUrl = url.parse(req.url, true);
                
                if (parsedUrl.pathname === '/oauth/callback') {
                    const code = parsedUrl.query.code;
                    
                    if (code) {
                        try {
                            await this.exchangeCodeForTokens(code, oauth2Client);
                            
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            res.end(`
                                <html>
                                    <body style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
                                        <h2>✅ OAuth 2.0 Configurado com Sucesso!</h2>
                                        <p>Refresh token obtido e salvo.</p>
                                        <p>Você pode fechar esta janela.</p>
                                        <script>setTimeout(() => window.close(), 3000);</script>
                                    </body>
                                </html>
                            `);
                            
                            server.close();
                            resolve();
                            
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

            server.listen(3000, () => {
                console.log('🌐 Servidor aguardando callback em http://localhost:3000');
                console.log('⏳ Aguardando autorização...\n');
            });
        });
    }

    async exchangeCodeForTokens(code, oauth2Client) {
        try {
            console.log('\n🔄 Trocando código por tokens...');
            
            const { tokens } = await oauth2Client.getToken(code);
            
            // Salvar refresh token
            const fs = require('fs');
            const path = require('path');
            
            const refreshTokenPath = path.join(process.cwd(), 'sensitive-data', 'youtube-refresh-token.txt');
            fs.writeFileSync(refreshTokenPath, tokens.refresh_token);
            
            console.log('\n✅ SUCESSO!');
            console.log(`📁 Refresh token salvo em: ${refreshTokenPath}`);
            console.log(`🔑 Refresh token: ${tokens.refresh_token}`);
            
            // Testar autenticação
            await this.testAuthentication(oauth2Client, tokens.refresh_token);
            
        } catch (error) {
            console.error('❌ Erro ao obter tokens:', error.message);
            console.log('\n💡 Dicas:');
            console.log('- Verifique se o código foi copiado corretamente');
            console.log('- Verifique se Client ID e Secret estão corretos');
            console.log('- Tente gerar uma nova URL de autorização');
        } finally {
            rl.close();
        }
    }

    async testAuthentication(oauth2Client, refreshToken) {
        try {
            oauth2Client.setCredentials({ refresh_token: refreshToken });

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
                console.log(`\n🎉 Acesso verificado ao canal: ${channel.snippet.title}`);
                console.log('🚀 Upload de vídeos funcionará corretamente!');
                console.log('\n✅ Execute "npm start" para testar o upload.');
            }

        } catch (error) {
            console.error('❌ Falha no teste de autenticação:', error.message);
        }
    }
}

// Executar setup
if (require.main === module) {
    const setup = new ManualOAuthSetup();
    setup.setup().catch(console.error);
}

module.exports = ManualOAuthSetup;
