#!/usr/bin/env node

/**
 * Script para verificar configuração OAuth
 * Execute: node scripts/check-oauth-config.js
 */

const fs = require('fs');

function checkOAuthConfig() {
    console.log('🔍 VERIFICANDO CONFIGURAÇÃO OAUTH\n');
    
    try {
        const clientId = fs.readFileSync('sensitive-data/youtube-client-id.txt', 'utf8').trim();
        const clientSecret = fs.readFileSync('sensitive-data/youtube-client-secret.txt', 'utf8').trim();
        
        console.log('✅ Credenciais OK');
        console.log(`📝 Client ID: ${clientId}`);
        console.log(`🔑 Client Secret: ${clientSecret.substring(0, 10)}...`);
        
        console.log('\n📋 CONFIGURAÇÃO NECESSÁRIA NO GOOGLE CLOUD:');
        console.log('1. APIs & Services → Credentials');
        console.log('2. Encontre seu OAuth 2.0 Client ID');
        console.log('3. Edit → Authorized redirect URIs');
        console.log('4. Adicione exatamente: urn:ietf:wg:oauth:2.0:oob');
        console.log('5. Salve e aguarde 2-3 minutos');
        
        console.log('\n🔗 URL DE EXEMPLO GERADA:');
        console.log('https://accounts.google.com/o/oauth2/v2/auth?');
        console.log('client_id=' + clientId + '&');
        console.log('redirect_uri=urn:ietf:wg:oauth:2.0:oob&');
        console.log('response_type=code&');
        console.log('scope=https://www.googleapis.com/auth/youtube%20https://www.googleapis.com/auth/youtube.upload&');
        console.log('access_type=offline&');
        console.log('prompt=consent');
        
        console.log('\n⏳ Após configurar, execute:');
        console.log('node scripts/get-refresh-token-manual.js');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

if (require.main === module) {
    checkOAuthConfig();
}

module.exports = checkOAuthConfig;
