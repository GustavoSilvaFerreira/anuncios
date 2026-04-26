#!/usr/bin/env node

/**
 * Script para verificar se callback OAuth foi recebido
 * Execute: node scripts/check-oauth-callback.js
 */

const http = require('http');
const url = require('url');

function checkCallback() {
    console.log('🔍 VERIFICANDO CALLBACK OAUTH\n');
    
    const server = http.createServer((req, res) => {
        const parsedUrl = url.parse(req.url, true);
        
        console.log(`📥 Requisição recebida: ${req.method} ${parsedUrl.pathname}`);
        
        if (parsedUrl.pathname === '/oauth/callback') {
            const code = parsedUrl.query.code;
            const error = parsedUrl.query.error;
            
            console.log('📋 Parâmetros recebidos:');
            console.log(`   - code: ${code ? '***' + code.substring(code.length - 10) : 'null'}`);
            console.log(`   - error: ${error || 'null'}`);
            console.log(`   - state: ${parsedUrl.query.state || 'null'}`);
            
            if (code) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                        <body style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
                            <h2>✅ Callback Recebido!</h2>
                            <p>Código de autorização capturado com sucesso.</p>
                            <p>Você pode fechar esta janela.</p>
                            <script>setTimeout(() => window.close(), 2000);</script>
                        </body>
                    </html>
                `);
                console.log('\n✅ SUCESSO! Callback recebido com código de autorização.');
                console.log('🔄 Execute o script principal para capturar e salvar o refresh token.');
            } else if (error) {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                        <body style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
                            <h2>❌ Erro no Callback</h2>
                            <p>Erro: ${error}</p>
                            <p>Verifique a configuração OAuth.</p>
                        </body>
                    </html>
                `);
                console.log(`\n❌ Erro recebido: ${error}`);
            } else {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end('<h2>❌ Código não encontrado</h2>');
                console.log('\n❌ Nenhum código ou erro encontrado no callback.');
            }
            
            server.close();
        } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h2>Página não encontrada</h2>');
        }
    });

    server.listen(3000, () => {
        console.log('🌐 Servidor de teste aguardando em http://localhost:3000');
        console.log('📋 Teste acessando: http://localhost:3000/oauth/callback?code=teste123');
        console.log('⏳ Aguardando callback OAuth...\n');
        
        // Timeout após 5 minutos
        setTimeout(() => {
            console.log('\n⏰ Timeout - servidor encerrado');
            server.close();
        }, 300000);
    });
}

if (require.main === module) {
    checkCallback();
}

module.exports = checkCallback;
