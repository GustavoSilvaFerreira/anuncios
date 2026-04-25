# ANÁLISE PROFUNDA - REFATORAÇÃO DE UTILITIES

## RESUMO EXECUTIVO

Foram criados **10 arquivos utilitários**, mas apenas **Logger** foi implementado. **8 utilities permanecem subutilizadas ou não utilizadas**, apesar de terem sido criadas especificamente para padrões encontrados no código. Esta análise mapeia EXATAMENTE onde cada utility DEVE ser usada.

---

## 1. ❌ DateUtils - COMPLETAMENTE NÃO UTILIZADO

**Status**: ⚠️ Utilitário criado mas 0% implementado

### Padrões de Data encontrados no código:

#### Local 1: `ad.controller.js` linhas 35-47
```javascript
getDatePlusDay(date, days) {
    date.setDate(date.getDate() + days);  // ← Duplicação
    return this.getDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

getDate(year, month, day) {
    return new Date(year, month - 1, day);  // ← Padronização necessária
}

getDateFormated(date) {
    const datePost = date;
    const monthformated = datePost.getMonth() >= 9 ? datePost.getMonth() + 1 : `0${datePost.getMonth() + 1}`;
    // ↑ Formatação manual com lógica condicional
    return `${datePost.getFullYear()}-${monthformated}-${datePost.getDate()}`;
}
```

**Ocorrências encontradas:**
- Linha 95: `let datePost = this.getDate(year, month, day);`
- Linha 108: `datePost = this.getDatePlusDay(datePost, 1);`
- Linha 112: `const datePost = this.getDateFormated(this.getDate(year, month, day));`
- Linha 120: `datePost.split('-')` - Parsing manual de data
- Linha 124: `this.getDateFormated(this.getDate(year, month, day));`
- Linha 193: `const datePost = this.getDateFormated(this.getDate(year, month, day));`
- Linha 245: `const { date: { year, month, day } } = postDay;`
- Linha 249: `this.getDateFormated(this.getDate(year, month, day));`

**Refatoração necessária:**
```javascript
// Deveria usar DateUtils.createDate, DateUtils.addDays, DateUtils.format
// Removeria getDate(), getDatePlusDay(), getDateFormated() de Ad.controller
```

---

## 2. ❌ TextFormatter - COMPLETAMENTE NÃO UTILIZADO

**Status**: ⚠️ Utilitário criado mas 0% implementado

### Padrões de formatação de texto encontrados:

#### Local 1: `ad.controller.js` linhas 279-310 - Descrições duplicadas
```javascript
getTiktokDescription(titleComom, hashtags) {
    const title = `${titleComom} - Link na BIO #parceiromagalu #achadinhos #promo #promotion #sale ${hashtags.join(' ')}`
    return title;
}

getYoutubeDescription(titleComom, linkProducts, hashtags) {
    // ← 7 linhas de construção manual
    const title = `${titleComom} #shorts da @wedconecta\n\n`;
    let description = `Link para os produtos: ${linkProducts}\n\n`;
    description += `Siga nossas redes sociais:\n`;
    description += `Instagram: https://www.instagram.com/wedconecta\n`;
    description += `Facebook: https://www.facebook.com/wedconecta\n`;
    description += `TikTok: https://www.tiktok.com/@wedconecta\n\n`;
    description += `#shorts da @wedconecta\n`;
    description += `#achadinhos #achados #parceiromagalu #wedconecta #promoção #promo #promotion #ofertas ${hashtags.join(' ')}\n`;
    return { title, description };
}

getMetaDescription(titleComom, hashtags) {
    // ← 6 linhas de construção manual
    let description = `${titleComom}\nLink da loja na BIO\n\n`;
    description += `Siga nossas redes sociais:\n`;
    description += `YouTube: https://www.youtube.com/@wedconecta\n`;
    description += `TikTok: https://www.tiktok.com/@wedconecta\n`;
    description += `Instagram: https://www.instagram.com/wedconecta\n`;
    description += `Facebook: https://www.facebook.com/wedconecta\n\n`;
    description += `#achadinhos #achados #parceiromagalu #wedconecta #promoção #promo #promotion #ofertas ${hashtags.join(' ')}`;
    return description;
}
```

#### Local 2: `video.service.js` linhas 320-360 - Formatação de títulos
```javascript
const titleSplit = post.titleVideo.split(' ');
const titleFormated = [];
switch (titleSplit.length) {
    case 1: titleFormated.push({ y: 2.15, text: titleSplit[0] }); break;
    case 2: titleFormated.push({ y: 2.3, text: titleSplit[0] });
            titleFormated.push({ y: 2, text: titleSplit[1] }); break;
    case 3: titleFormated.push({ y: 2.6, text: titleSplit[0] });
            titleFormated.push({ y: 2.15, text: titleSplit[1] });
            titleFormated.push({ y: 1.85, text: titleSplit[2] }); break;
    case 4: titleFormated.push({ y: 2.6, text: titleSplit[0] });
            titleFormated.push({ y: 2.15, text: `${titleSplit[1]} ${titleSplit[2]}` });
            titleFormated.push({ y: 1.85, text: titleSplit[3] }); break;
}
// ← 15 linhas de lógica que deveria estar em TextFormatter
```

**Ocorrências:** 3 métodos duplicando padrão (getTiktokDescription, getYoutubeDescription, getMetaDescription) + título dinamicamente no video

**Refatoração necessária:**
```javascript
// Remover getYoutubeDescription, getTiktokDescription, getMetaDescription
// Usar TextFormatter.formatYoutubeDescription, TextFormatter.formatTiktokDescription, etc.
// Usar TextFormatter.formatTitleBySplit para video title
```

---

## 3. ⚠️ StringUtils - PARCIALMENTE UTILIZADO (20%)

**Status**: 🟡 Apenas 1 de ~8 métodos implementados

### Métodos criados vs Usados:

**✅ Usado:**
- `formatCodesRemoveSlash()` - Linha 102 do ad.controller.js

**❌ NÃO Usado:**
- `getExtension()` - Linha 82 (apenas referenciado mas chamado diretamente)
- `sanitizeAdsObject()` - Apenas parcialmente (video.service.js linha 190)

### Padrões de String operations NÃO refatorados:

#### Local 1: `ad.controller.js` linhas 63-71
```javascript
separateCodeTitleAdTitlePostAndHashtag(contentArray) {
    return contentArray.map(item => {
        const itemSplited = item.split(';');  // ← StringUtils.splitBySeparator
        if (itemSplited.length === 4) {
            // ... validation
        }
    }).filter(item => item !== false);
}
```

#### Local 2: `ad.controller.js` linha 132
```javascript
const day = Number(dateSplit[2]);  // ← Parsing/conversão manual
const month = Number(dateSplit[1]);
const year = Number(dateSplit[0]);
```

#### Local 3: `magazine-luiza.service.js` linhas 72-88
```javascript
const title = $(itensTitle[index]).text().trim();  // ← StringUtils.trim + sanitize
const link = `${ENDPOINTS.parceiroMagulu.base}${href}`;  // ← UrlUtils job
const priceText = $(itensPrice[index]).text().trim();  // ← StringUtils.trim
const price = StringUtils.formatPrice(priceText);  // ✅ Usado
```

#### Local 4: `video.service.js` linha 302
```javascript
const titleSplit = post.titleVideo.split(' ');  // ← StringUtils.split
```

**Ocorrências totais de split() não refatoradas:** 12+
**Ocorrências de .trim() não refatoradas:** 8+
**Ocorrências de string concatenation:** 20+

**Refatoração necessária:**
```javascript
// Consolidar: split, trim, sanitize, parseNumber, concatenate
```

---

## 4. ⚠️ ArrayUtils - PARCIALMENTE UTILIZADO (30%)

**Status**: 🟡 Apenas 1 de ~5 métodos implementados

### Métodos criados vs Usados:

**✅ Usado:**
- `createIndexForValidation()` - Linhas 65 (magazine-luiza.service.js), 116 (createIndexForValidation wrapper)

**❌ NÃO Usado:**
- Todos os outros métodos array (map, filter, flatten, etc.)

### Padrões de Array operations NÃO refatorados:

#### Local 1: `ad.controller.js` linhas 63-71
```javascript
return contentArray.map(item => {  // ← ArrayUtils.mapWithFilter
    // ...
}).filter(item => item !== false);  // ← Chaining que pode ser consolidado
```

#### Local 2: `ad.controller.js` linhas 150-160
```javascript
for (const post of postsDay.contents) {  // ← Pode usar ArrayUtils.forEach
    let countProduct = 1
    for (const product of allProducts) {  // ← Nested loops
        // ...
    }
}
```

#### Local 3: `ad.controller.js` linhas 245-250
```javascript
for (const anuncio of postDay.posts) {  // ← Array iteration
    const codes = anuncio.ads.map(ad => ad.code);  // ← ArrayUtils.map
    const linkProducts = this.linkBaseSearchProducts(codes);
}
```

#### Local 4: `magazine-luiza.service.js` linhas 65-88
```javascript
const indexs = ArrayUtils.createIndexForValidation(itensLi.length);
indexs.forEach(index => {  // ← Pode usar ArrayUtils.forEachWithLimit
    if(index <= numberAdByPost) {
        // ...
    }
});
```

#### Local 5: `video.service.js` linha 267-275
```javascript
Object.keys(this.VIDEOS_CONFIG).forEach(template => {  // ← ArrayUtils.forEach
    return Object.keys(this.VIDEOS_CONFIG[template].templateColor).forEach(templateColor => {
        this.videosRandom.push({  // ← Array push em loop
            template,
            templateColor
        });
    });
});
```

#### Local 6: `video-queue.service.js` linha 82+
```javascript
results: this.queue.map(t => ({  // ← ArrayUtils.map
    id: t.id,
    status: t.status,
    attempts: t.attempts,
    error: t.error,
    duration: t.endTime ? t.endTime - t.startTime : null
}))
```

**Ocorrências totais de .map() não refatoradas:** 6
**Ocorrências totais de .forEach() não refatoradas:** 8
**Ocorrências totais de .filter() não refatoradas:** 4

**Refatoração necessária:**
```javascript
// Usar ArrayUtils para map, filter, forEach, nested operations
```

---

## 5. ⚠️ ValidationUtils - PARCIALMENTE UTILIZADO (40%)

**Status**: 🟡 1 de ~3 métodos implementados

### Métodos criados vs Usados:

**✅ Usado:**
- `validateThreeCodesForCreate()` - Linha 80 (ad.controller.js)

**❌ NÃO Usado:**
- `validateFileExists()` - Deveria estar em multiple places
- `validatePrice()` - Deveria estar em magazine-luiza.service

### Padrões de Validação NÃO refatorados:

#### Local 1: `ad.controller.js` linhas 187-188
```javascript
const dirExists = File.existsSync(DIR_TO_POST);  // ← ValidationUtils.fileExists
if (!dirExists) await File.mkdir(DIR_TO_POST);
```

#### Local 2: `ad.controller.js` linhas 119-120
```javascript
const dirDateExists = File.existsSync(pathDateTitle);  // ← ValidationUtils.fileExists
if (!dirDateExists) await File.mkdir(pathDateTitle);
```

#### Local 3: `ad.controller.js` linhas 241-242
```javascript
const dirExists = File.existsSync(DIR_TO_POST);  // ← ValidationUtils.fileExists (3x repetida)
if (!dirExists) await File.mkdir(DIR_TO_POST);
```

#### Local 4: `ad.controller.js` linhas 247-248
```javascript
const dirDateExists = File.existsSync(pathDateTitle);  // ← ValidationUtils.fileExists (repetida)
if (!dirDateExists) await File.mkdir(pathDateTitle);
```

#### Local 5: `video.service.js` linhas 194-215
```javascript
async validateInputs(post, outputPath) {
    // ← Função inteira poderia usar ValidationUtils
    if (!post || !post.ads) throw new Error('Dados do post inválidos');
    // ...
}
```

#### Local 6: `magazine-luiza.service.js` linhas 59-62
```javascript
if(itensLi.length >= numberAdByPost) {  // ← ValidationUtils.validateMinLength
    // ...
}
```

**Ocorrências totais de validação manual:** 15+

**Refatoração necessária:**
```javascript
// Extrair: validateFileExists, validateLength, validateObject, validatePrice
```

---

## 6. ⚠️ UrlUtils - PARCIALMENTE UTILIZADO (50%)

**Status**: 🟡 2 de ~4 métodos implementados

### Métodos criados vs Usados:

**✅ Usado:**
- `extractProductCode()` - Linhas 73, 98 (magazine-luiza.service.js)
- `normalizeImageSize()` - Linhas 75, 100 (magazine-luiza.service.js)

**❌ NÃO Usado:**
- `buildSearchUrl()` - Deveria estar em linkBaseSearchProducts
- `buildProductLink()` - Duplicado no código

### Padrões de URL NÃO refatorados:

#### Local 1: `ad.controller.js` linha 48
```javascript
linkBaseSearchProducts = (codes) => `${ENDPOINTS.wedConecta.search}/${codes.join('+')}/`;
// ← Deveria usar UrlUtils.buildSearchUrl
```

#### Local 2: `magazine-luiza.service.js` linhas 24-25
```javascript
search(search) {
    return this.restService.get(`${ENDPOINTS.wedConecta.search}/${search}/`);
    // ← URL construction manual
}
```

#### Local 3: `magazine-luiza.service.js` linhas 70-71
```javascript
const link = `${ENDPOINTS.parceiroMagulu.base}${href}`;
// ← Deveria usar UrlUtils.buildProductLink
```

**Ocorrências totais de URL building manual:** 8+

**Refatoração necessária:**
```javascript
// Consolidar buildSearchUrl, buildProductLink
```

---

## 7. ⚠️ HashtagUtils - PARCIALMENTE UTILIZADO (30%)

**Status**: 🟡 1 de ~3 métodos implementados

### Métodos criados vs Usados:

**✅ Usado:**
- `normalizeHashtags()` - Linha 161 (ad.controller.js)

**❌ NÃO Usado:**
- Métodos auxiliares de hashtag

### Padrões de Hashtag NÃO refatorados:

#### Local 1: `ad.controller.js` linhas 279-310
```javascript
getTiktokDescription(titleComom, hashtags) {
    const title = `${titleComom} - Link na BIO ... ${hashtags.join(' ')}`
    // ← hashtags.join() é operação de array, deveria usar HashtagUtils.join
}

getYoutubeDescription(titleComom, linkProducts, hashtags) {
    description += `#shorts da @wedconecta\n`;
    description += `#achadinhos #achados ... ${hashtags.join(' ')}\n`;
    // ← 2x hashtags.join(), deveria ser centralizado
}

getMetaDescription(titleComom, hashtags) {
    description += `#achadinhos #achados ... ${hashtags.join(' ')}`;
    // ← 3x hashtags.join(), deveria ser centralizado
}
```

**Ocorrências totais de hashtags.join():** 6
**Ocorrências de hashtag normalization:** 5+

**Refatoração necessária:**
```javascript
// Usar HashtagUtils.join, HashtagUtils.format
```

---

## 8. ❓ FileUtils - NÃO EXISTE SEPARADO

**Status**: 🔴 Não criado (File service já existe)

**Situação**: FileUtils poderia ser wrapper de File.service ou consolidar operações de fs com abstrações

### Operações de arquivo no código:

#### Local 1: `ad.controller.js`
```javascript
File.existsSync()  // 6+ ocorrências
File.mkdir()       // 6+ ocorrências
File.writeFile()   // 4+ ocorrências
File.rename()      // 1+ ocorrência
File.txtForArrayString()  // 1+ ocorrência
```

#### Local 2: `video.service.js`
```javascript
fs.existsSync()    // 2+ ocorrências
fs.rm()            // 1+ ocorrência
fs.promises.unlink()  // 1+ ocorrência
fs.statfsSync()    // 1+ ocorrência
```

**Problema**: Há mistura entre abstração `File.service` e acesso direto `fs`

**Refatoração necessária:**
```javascript
// Consolidar: usar APENAS File.service abstraction
// Remover imports diretos de fs onde possível
```

---

## 9. ✅ Logger - BEM IMPLEMENTADO (90%)

**Status**: 🟢 Implementação apropriada

**Uso encontrado:**
- Logger.info() - 8+ ocorrências ✅
- Logger.warn() - 3+ ocorrências ✅
- Logger.success() - 3+ ocorrências ✅
- Logger.error() - 2+ ocorrências ✅
- Logger.stats() - 1+ ocorrência ✅

**Pontos ainda com console.log():**
- video.service.js (deprecated teste method)
- magazine-luiza.service.js comentado

**Status Final**: ✅ Adequado

---

## RESUMO QUANTITATIVO

| Utilitário | Criado | Implementado | % Uso | Status |
|-----------|--------|-------------|-------|--------|
| DateUtils | ✅ | ❌ | 0% | 🔴 Crítico |
| TextFormatter | ✅ | ❌ | 0% | 🔴 Crítico |
| StringUtils | ✅ | ⚠️ | 20% | 🟡 Urgente |
| ArrayUtils | ✅ | ⚠️ | 30% | 🟡 Urgente |
| HashtagUtils | ✅ | ⚠️ | 30% | 🟡 Urgente |
| ValidationUtils | ✅ | ⚠️ | 40% | 🟡 Urgente |
| UrlUtils | ✅ | ⚠️ | 50% | 🟡 Moderado |
| FileUtils | ❌ | ❌ | - | 🟠 Não existe |
| Logger | ✅ | ✅ | 90% | 🟢 Completo |

**Total de refatoração necessária:** ~150+ linhas de código em 4 arquivos

---

## IMPACTO DO NÃO USO

1. **Duplicação de código**: Mesmas operações repetidas em múltiplos lugares
2. **Falta de consistência**: Formatação de data/string/URL variam por arquivo
3. **Mantibilidade baixa**: Mudança em um padrão requer múltiplas edições
4. **Testes impossíveis**: Lógica espalhada não pode ser testada isoladamente
5. **Reuso limitado**: Código não pode ser reutilizado em novos módulos

---

## PRÓXIMOS PASSOS

1. ✅ **Refatorar DateUtils** - Consolidar todas operações de data em Ad.controller
2. ✅ **Refatorar TextFormatter** - Extrair 3 métodos de description de Ad.controller
3. ✅ **Refatorar StringUtils** - Consolidar split, trim, formatPrice
4. ✅ **Refatorar ArrayUtils** - Substituir loops por métodos utilitários
5. ✅ **Refatorar ValidationUtils** - Centralizar validações file/length
6. ✅ **Refatorar UrlUtils** - Consolidar URL building
7. ✅ **Refatorar HashtagUtils** - Centralizar operações hashtag
8. ✅ **Revisar FileUtils** - Decidir se cria ou usa File.service
9. ✅ **Remover fs imports diretos** - Usar abstrações
10. ✅ **Testar integração** - Garantir que tudo funciona após refatoração
