#!/usr/bin/env node

/**
 * Script para testar se OAuth client está disponível
 * Execute: node scripts/test-oauth-client.js
 */

const fs = require('fs');

function testOAuthClient() {
    console.log('🔍 VERIFICANDO OAUTH CLIENT\n');
    
    try {
        const clientId = fs.readFileSync('sensitive-data/youtube-client-id.txt', 'utf8').trim();
        const clientSecret = fs.readFileSync('sensitive-data/youtube-client-secret.txt', 'utf8').trim();
        
        console.log('✅ Credenciais lidas com sucesso:');
        console.log(`📝 Client ID: ${clientId.substring(0, 20)}...`);
        console.log(`🔑 Client Secret: ${clientSecret.substring(0, 10)}...`);
        
        // Verificar formato do Client ID
        if (clientId.includes('.apps.googleusercontent.com')) {
            console.log('✅ Formato do Client ID está correto');
        } else {
            console.log('❌ Formato do Client ID parece incorreto');
        }
        
        // Verificar formato do Client Secret
        if (clientSecret.length >= 24) {
            console.log('✅ Formato do Client Secret está correto');
        } else {
            console.log('❌ Formato do Client Secret parece incorreto');
        }
        
        console.log('\n📋 PRÓXIMOS PASSOS:');
        console.log('1. Aguarde 10-15 minutos se criou agora');
        console.log('2. Execute: node scripts/get-refresh-token-manual.js');
        console.log('3. Se ainda der erro, verifique no Google Cloud Console');
        
    } catch (error) {
        console.error('❌ Erro ao ler credenciais:', error.message);
    }
}

if (require.main === module) {
    testOAuthClient();
}

module.exports = testOAuthClient;
