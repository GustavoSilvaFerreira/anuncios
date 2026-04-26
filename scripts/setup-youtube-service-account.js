#!/usr/bin/env node

/**
 * Script para configurar Service Account do YouTube
 * Execute: node scripts/setup-youtube-service-account.js
 */

const fs = require('fs');
const path = require('path');
const { Logger } = require('../src/shared/utils');

console.log('🔧 CONFIGURAÇÃO YOUTUBE SERVICE ACCOUNT\n');

console.log('📋 PASSOS PARA CONFIGURAR SERVICE ACCOUNT:\n');

console.log('1. Acesse Google Cloud Console:');
console.log('   https://console.cloud.google.com/\n');

console.log('2. Selecione seu projeto ou crie um novo\n');

console.log('3. Ative YouTube Data API v3:');
console.log('   APIs & Services → Library → YouTube Data API v3 → Enable\n');

console.log('4. Crie Service Account:');
console.log('   APIs & Services → Credentials → Create Credentials → Service Account\n');
console.log('   - Name: youtube-uploader-service');
console.log('   - Description: Automated YouTube Upload Service\n');
console.log('   - Click "Create and Continue"\n');
console.log('   - Role: Project → Owner (ou YouTube Data API v3)\n');
console.log('   - Click "Continue" → "Done"\n');

console.log('5. Crie chave JSON:');
console.log('   Encontre o Service Account criado → Actions → Manage keys');
console.log('   Add Key → Create new key → JSON → Create\n');
console.log('   O arquivo JSON será baixado automaticamente\n');

console.log('6. Configure o projeto:\n');

// Criar diretório se não existir
const sensitiveDir = path.join(process.cwd(), 'sensitive-data');
if (!fs.existsSync(sensitiveDir)) {
    fs.mkdirSync(sensitiveDir, { recursive: true });
}

console.log(`7. Mova o arquivo JSON baixado para:`);
console.log(`   ${path.join(sensitiveDir, 'youtube-service-account.json')}\n`);

console.log('8. Configure o .env:');
console.log('   YOUTUBE_SERVICE_ACCOUNT_KEY=sensitive-data/youtube-service-account.json\n');

console.log('9. IMPORTANTE - Vincule ao canal YouTube:');
console.log('   - Service Accounts sozinhos não podem fazer upload');
console.log('   - Precisa usar OAuth 2.0 com refresh token OU');
console.log('   - Vincular o Service Account através de Workspace\n');

console.log('\n📄 ALTERNATIVA: REFRESH TOKEN (Mais simples para backend)\n');
console.log('Se Service Account for complexo, use OAuth 2.0 com refresh token:');
console.log('1. Crie OAuth 2.0 Client ID (Web application)');
console.log('2. Obtenha refresh token uma vez via script');
console.log('3. Use refresh token indefinidamente no backend');
console.log('4. Sem necessidade de interface web após setup inicial\n');

console.log('✅ Após configurar, execute:');
console.log('   npm start\n');

console.log('\n📚 Documentação:');
console.log('https://developers.google.com/youtube/v3/guides/uploading_videos');
