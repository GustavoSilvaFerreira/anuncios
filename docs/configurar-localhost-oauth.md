# 🔧 CONFIGURAR LOCALHOST OAUTH 2.0

## 📋 PROBLEMA: `urn:ietf:wg:oauth:2.0:oob` não é mais permitido

O Google Cloud mudou as regras e não permite mais o redirect URI manual. Precisamos usar localhost.

## 🔧 SOLUÇÃO - CONFIGURAR LOCALHOST:

### 1. No Google Cloud Console:
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services → Credentials
3. Encontre seu OAuth 2.0 Client ID
4. Edit → Authorized redirect URIs
5. Adicione: `http://localhost:3000/oauth/callback`
6. Salve

### 2. Execute o script atualizado:
```bash
node scripts/get-refresh-token-manual.js
```

### 3. Fluxo automático:
1. Script gera URL de autorização
2. Você cola URL no navegador
3. Faz login Google
4. É redirecionado para localhost automaticamente
5. Script captura código e salva refresh token

## 🌐 COMO FUNCIONA:

O script agora:
- Inicia servidor HTTP local na porta 3000
- Aguarda callback do OAuth
- Captura código automaticamente
- Salva refresh token
- Mostra página de sucesso

## 📋 CONFIGURAÇÃO NECESSÁRIA:

**Google Cloud Console:**
- Application type: Web application
- Authorized redirect URIs: `http://localhost:3000/oauth/callback`

**Arquivos de credenciais:**
- `sensitive-data/youtube-client-id.txt` - Seu Client ID
- `sensitive-data/youtube-client-secret.txt` - Seu Client Secret

## 🚀 EXECUTAR:

```bash
# 1. Configurar redirect URI no Google Cloud
# 2. Executar script
node scripts/get-refresh-token-manual.js

# 3. Seguir instruções
# 4. Testar upload
npm start
```

## ✅ RESULTADO:

Após configurar, você verá:
```
🔧 OBTENDO REFRESH TOKEN DO YOUTUBE

📋 PASSOS:
1. Copie e cole esta URL no seu navegador:
https://accounts.google.com/o/oauth2/v2/auth?...

🌐 Servidor aguardando callback em http://localhost:3000
⏳ Aguardando autorização...
```

**Configure `http://localhost:3000/oauth/callback` no Google Cloud e execute o script!**
