# 🔧 RESOLVER ERRO APP NÃO VERIFICADO GOOGLE

## 🚨 PROBLEMA: `403: access_denied` - App em modo de teste

O app "anuncios" está em fase de teste e só pode ser acessado por testadores aprovados.

## ✅ SOLUÇÃO 1: ADICIONAR COMO TESTADOR (MAIS RÁPIDO)

### Passos:
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services → OAuth consent screen
3. Selecione seu app "anuncios"
4. Em "Test users", clique "ADD USERS"
5. Adicione seu email: `wewefeh@gmail.com`
6. Salve
7. Aguarde 1-2 minutos para propagar
8. Execute o script novamente

## ✅ SOLUÇÃO 2: MUDAR PARA PRODUÇÃO (SE JÁ ESTIVER PRONTO)

### Se o app estiver pronto para uso público:
1. APIs & Services → OAuth consent screen
2. Publishing app → PUBLISH APP
3. Preencha informações obrigatórias
4. Aguarde aprovação do Google (pode demorar dias)

## ✅ SOLUÇÃO 3: USAR APP EXISTENTE (ALTERNATIVA)

### Se tiver outro app já verificado:
1. Crie novo OAuth Client ID em app verificado
2. Use essas credenciais no projeto
3. Atualize os arquivos de credenciais

## 🚀 EXECUTAR APÓS CORREÇÃO:

```bash
node scripts/get-refresh-token-manual.js
```

## 📋 VERIFICAÇÃO:

Após adicionar como testador, você deverá ver:
```
🔧 OBTENDO REFRESH TOKEN DO YOUTUBE

📋 PASSOS:
1. Copie e cole esta URL no seu navegador:
https://accounts.google.com/o/oauth2/v2/auth?...

🌐 Servidor aguardando callback em http://localhost:3000
⏳ Aguardando autorização...
```

## ⚠️ IMPORTANTE:

- **Modo teste:** Apenas emails adicionados como "Test users" podem acessar
- **Propagação:** Pode levar 1-2 minutos após adicionar email
- **Produção:** Requer verificação completa do Google

**Adicione seu email como testador no OAuth consent screen!**
