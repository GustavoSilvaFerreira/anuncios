# 📋 CONFIGURAR CREDENCIAIS YOUTUBE

## 🔧 PASSOS PARA OBTER AS CREDENCIAIS:

### 1. API Key (Para listar vídeos - já funciona)
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione seu projeto
3. APIs & Services → Library → YouTube Data API v3 → Enable
4. APIs & Services → Credentials → Create Credentials → API Key
5. Copie a chave e salve em `sensitive-data/api-key-youtube.txt`

### 2. OAuth 2.0 Client ID & Secret (Para upload)
1. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
2. Application type: Web application
3. Authorized redirect URIs: `http://localhost:3000/oauth/callback`
4. Click Create
5. Copie Client ID e Client Secret

### 3. Obter Refresh Token (Setup único)
Execute o script de setup:
```bash
node scripts/setup-youtube-oauth.js
```

O script irá:
1. Gerar URL de autorização
2. Abrir navegador para login Google
3. Capturar refresh token automaticamente
4. Salvar em `sensitive-data/youtube-refresh-token.txt`

## 📁 ARQUIVOS DE CONFIGURAÇÃO:

### sensitive-data/api-key-youtube.txt
```
SUA_API_KEY_AQUI
```

### sensitive-data/youtube-client-id.txt
```
SEU_CLIENT_ID_AQUI
```

### sensitive-data/youtube-client-secret.txt
```
SEU_CLIENT_SECRET_AQUI
```

### sensitive-data/youtube-refresh-token.txt
```
REFRESH_TOKEN_AQUI
```

## 🚀 EXECUTAR SETUP:

```bash
# 1. Configurar OAuth 2.0
node scripts/setup-youtube-oauth.js

# 2. Testar upload
npm start
```

## ✅ RESULTADO ESPERADO:

Após configurar as credenciais, o upload funcionará automaticamente:
```
[INFO] Iniciando upload do vídeo: Esporte e Lazer
[INFO] Upload progress: 5%...10%...15%...100%
[✓] Vídeo uploadado com sucesso: dQw4w9WgXcQ
[✓] Vídeo agendado: Esporte e Lazer para 29/04/2026 18:30
```

## 🔍 VERIFICAÇÃO:

Para verificar se está funcionando:
```bash
node scripts/setup-youtube-oauth.js
```

Se mostrar "✅ OAuth 2.0 Configurado com Sucesso!", está pronto!
