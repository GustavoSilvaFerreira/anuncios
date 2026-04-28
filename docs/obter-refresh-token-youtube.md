# 🔑 COMO OBTER REFRESH TOKEN DO YOUTUBE

## 📋 MÉTODO 1: AUTOMÁTICO (RECOMENDADO)

Execute o script automático:
```bash
node scripts/get-refresh-token-manual.js
```

O script irá:
1. Gerar URL de autorização
2. Você cola a URL no navegador
3. Faz login Google
4. Copia o código da página
5. Cola no terminal
6. Script salva refresh token automaticamente

## 📋 MÉTODO 2: MANUAL (PASSO A PASSO)

### Passo 1: Criar OAuth 2.0 Client
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
3. Application type: Web application
4. Authorized redirect URIs: `urn:ietf:wg:oauth:2.0:oob`
5. Salve Client ID e Client Secret nos arquivos

### Passo 2: Gerar URL de Autorização
Use esta URL (substitua SEU_CLIENT_ID):
```
https://accounts.google.com/o/oauth2/v2/auth?
client_id=SEU_CLIENT_ID&
redirect_uri=urn:ietf:wg:oauth:2.0:oob&
scope=https://www.googleapis.com/auth/youtube%20https://www.googleapis.com/auth/youtube.upload&
response_type=code&
access_type=offline&
prompt=consent
```

### Passo 3: Obter Código
1. Cole a URL no navegador
2. Faça login com conta Google
3. Conceda permissões
4. Copie o código mostrado

### Passo 4: Trocar Código por Refresh Token
Use o script ou faça via curl:
```bash
curl -d "client_id=SEU_CLIENT_ID&client_secret=SEU_CLIENT_SECRET&code=SEU_CODIGO&grant_type=authorization_code&redirect_uri=urn:ietf:wg:oauth:2.0:oob" https://oauth2.googleapis.com/token
```

### Passo 5: Salvar Refresh Token
Cole o refresh token em:
```
sensitive-data/youtube-refresh-token.txt
```

## 🔍 VERIFICAÇÃO

Para testar se funcionou:
```bash
node scripts/get-refresh-token-manual.js
```

Se mostrar "🎉 Acesso verificado ao canal", está pronto!

## 🚀 EXECUTAR UPLOAD

Após obter refresh token:
```bash
npm start
```

## 💡 DICAS IMPORTANTES

- **Prompt=consent**: Essencial para obter refresh token
- **Access_type=offline**: Necessário para refresh token persistente  
- **Redirect URI**: Use `urn:ietf:wg:oauth:2.0:oob` para manual
- **Escopos**: Inclua ambos `youtube` e `youtube.upload`

## ❌ PROBLEMAS COMUNS

**"invalid_client"**: Verifique Client ID e Secret
**"invalid_grant"**: Código expirou, gere nova URL
**"access_denied"**: Usuário negou permissão

## ✅ RESULTADO FINAL

Arquivo final deve conter apenas o refresh token:
```
1//04abcdefghijklmnopqrstuvwx-xyz123abc
```

Este token não expira e pode ser usado indefinidamente!
