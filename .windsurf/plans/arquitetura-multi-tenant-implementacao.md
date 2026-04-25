# Plano de Implementação: Arquitetura Multi-Tenant

Plano completo para implementação de arquitetura multi-tenant suportando múltiplos canais de redes sociais e e-commerce com reaproveitamento máximo de código.

## 📋 Visão Geral

Transformar o atual sistema single-tenant (@wedconecta apenas) em uma arquitetura multi-tenant que suporte infinitos canais, cada um com suas próprias configurações, API keys, endpoints e identidades.

## 🎯 Objetivos

- ✅ Suporte a múltiplos canais simultâneos
- ✅ API keys isoladas por canal
- ✅ Endpoints configuráveis por canal
- ✅ TextFormatter genérico e reutilizável
- ✅ Services multi-channel com injeção de dependência
- ✅ Configurações centralizadas e seguras

## 🚨 Problemas Atuais a Resolver

### 1. **API Keys Single-Tenant**
```javascript
// PROBLEMA: constants.js
const secrets = Object.freeze({
    youtubeApiKey: process.env.YOUTUBE_API_KEY // Apenas uma chave global
});

// YoutubeService
key = CONSTANTS.secrets.youtubeApiKey; // Hard-coded global
```

### 2. **Endpoints Fixos**
```javascript
// PROBLEMA: magazine-luiza.service.js
search(search) {
    return this.restService.get(`${ENDPOINTS.wedConecta.search}/${search}/`);
}

// url.config.js
wedConecta: {
    search: `${BASE_URL_PARCEIRO_MAGALU}${PATH_WED_CONECTA}/busca`
}
```

### 3. **Identidades Hard-coded**
```javascript
// PROBLEMA: text-formatter.utils.js
description += `Instagram: https://www.instagram.com/wedconecta\n`;
description += `Facebook: https://www.facebook.com/wedconecta\n`;
description += `TikTok: https://www.tiktok.com/@wedconecta\n`;
```

## 🏗️ Arquitetura Proposta

### Fase 1: Estrutura de Configuração Multi-Channel

#### 1.1 Criar ChannelContext
```javascript
// src/shared/models/channel-context.js
class ChannelContext {
    constructor(channelConfig) {
        this.channelId = channelConfig.id;
        this.name = channelConfig.name;
        this.displayName = channelConfig.displayName;
        this.apis = channelConfig.apis;
        this.endpoints = channelConfig.endpoints;
        this.socialMedia = channelConfig.socialMedia;
        this.ecommerce = channelConfig.ecommerce;
    }
    
    getApiKey(platform) {
        return this.apis[platform]?.apiKey;
    }
    
    getEndpoint(service) {
        return this.endpoints[service];
    }
    
    getSocialMediaConfig(platform) {
        return this.socialMedia[platform];
    }
}
```

#### 1.2 Criar Channels Config
```javascript
// src/config/channels.config.js
const CHANNELS_CONFIG = {
    wedconecta: {
        id: 'wedconecta',
        name: 'wedconecta',
        displayName: 'Wed Conecta',
        apis: {
            youtube: {
                apiKey: process.env.WEDCONECTA_YOUTUBE_API_KEY,
                channelId: 'UCEsHJAZezJSuOUEqLJ3t2dg'
            },
            instagram: {
                apiKey: process.env.WEDCONECTA_INSTAGRAM_API_KEY,
                accessToken: process.env.WEDCONECTA_INSTAGRAM_TOKEN
            },
            tiktok: {
                apiKey: process.env.WEDCONECTA_TIKTOK_API_KEY
            }
        },
        endpoints: {
            ecommerce: {
                search: process.env.WEDCONECTA_ECOMMERCE_SEARCH_URL,
                base: process.env.WEDCONECTA_ECOMMERCE_BASE_URL
            }
        },
        socialMedia: {
            youtube: {
                handle: '@wedconecta',
                url: 'https://www.youtube.com/@wedconecta'
            },
            instagram: {
                handle: 'wedconecta',
                url: 'https://www.instagram.com/wedconecta'
            },
            tiktok: {
                handle: '@wedconecta',
                url: 'https://www.tiktok.com/@wedconecta'
            }
        },
        ecommerce: {
            baseUrl: 'https://www.magazinevoce.com.br',
            path: 'magazinewedconecta',
            imgSize: '618x463'
        }
    },
    
    outromarca: {
        id: 'outromarca',
        name: 'outromarca',
        displayName: 'Outra Marca',
        apis: {
            youtube: {
                apiKey: process.env.OUTROMARCA_YOUTUBE_API_KEY,
                channelId: 'OUTRO_CHANNEL_ID'
            }
        },
        endpoints: {
            ecommerce: {
                search: process.env.OUTROMARCA_ECOMMERCE_SEARCH_URL,
                base: process.env.OUTROMARCA_ECOMMERCE_BASE_URL
            }
        },
        socialMedia: {
            youtube: {
                handle: '@outromarca',
                url: 'https://www.youtube.com/@outromarca'
            }
        },
        ecommerce: {
            baseUrl: 'https://www.outraloja.com.br',
            path: 'outramarca',
            imgSize: '500x500'
        }
    }
};
```

#### 1.3 Environment Variables
```bash
# .env
# Canal Wed Conecta
WEDCONECTA_YOUTUBE_API_KEY=./secrets/wedconecta/youtube-api-key.txt
WEDCONECTA_INSTAGRAM_API_KEY=./secrets/wedconecta/instagram-api-key.txt
WEDCONECTA_ECOMMERCE_SEARCH_URL=https://www.magazinevoce.com.br/magazinewedconecta/busca
WEDCONECTA_ECOMMERCE_BASE_URL=https://www.magazinevoce.com.br

# Canal Outra Marca
OUTROMARCA_YOUTUBE_API_KEY=./secrets/outromarca/youtube-api-key.txt
OUTROMARCA_ECOMMERCE_SEARCH_URL=https://www.outraloja.com.br/outramarca/busca
OUTROMARCA_ECOMMERCE_BASE_URL=https://www.outraloja.com.br

# Canal Ativo (para desenvolvimento)
ACTIVE_CHANNEL=wedconecta
```

### Fase 2: Services Multi-Channel

#### 2.1 Refatorar YoutubeService
```javascript
// src/modules/youtube/services/youtube.service.js
class YoutubeService {
    constructor(channelContext) {
        this.channelContext = channelContext;
        this.apiKey = channelContext.getApiKey('youtube');
        this.channelId = channelContext.apis.youtube.channelId;
        this._validateApiKey();
    }
    
    _validateApiKey() {
        if (!this.apiKey) {
            Logger.error(`YouTube API Key não configurada para canal ${this.channelContext.name}`);
        }
    }
    
    async searchVideos(searchQuery, channelId = null) {
        // ... implementação usando this.apiKey e this.channelId
    }
}
```

#### 2.2 Criar BaseEcommerceService
```javascript
// src/modules/ecommerce/services/base-ecommerce.service.js
class BaseEcommerceService {
    constructor(channelContext) {
        this.channelContext = channelContext;
        this.endpoints = channelContext.getEndpoint('ecommerce');
        this.restService = new RestService();
        this.imgSize = channelContext.ecommerce.imgSize;
        this.itensTagHtml = 'li.sc-fHsjty';
    }
    
    search(search) {
        const searchUrl = `${this.endpoints.search}/${search}/`;
        return this.restService.get(searchUrl);
    }
    
    async loadHtmlCheerio(codesFormated) {
        const result = await this.search(codesFormated);
        await File.writeFile(`${DIR_EXAMPLES}/html-teste-${this.channelContext.name}.html`, result.data);
        return cheerio.load(result.data);
    }
}

// src/modules/ecommerce/services/magazine-luiza.service.js
class MagazineLuizaService extends BaseEcommerceService {
    constructor(channelContext) {
        super(channelContext);
        // Configurações específicas se necessário
    }
}
```

### Fase 3: Controllers Multi-Channel

#### 3.1 Refatorar AdController
```javascript
// src/modules/ads/controllers/ad.controller.js
class Ad {
    constructor(channelId = process.env.ACTIVE_CHANNEL || 'wedconecta') {
        const channelConfig = CHANNELS_CONFIG[channelId];
        if (!channelConfig) {
            throw new Error(`Canal ${channelId} não configurado`);
        }
        
        this.channelContext = new ChannelContext(channelConfig);
        this.magazineLuizaService = new MagazineLuizaService(this.channelContext);
        this.videoService = new VideoService(this.channelContext);
        this.youtubeService = new YoutubeService(this.channelContext);
        
        // ... resto do constructor
    }
    
    linkBaseSearchProducts = (codes) => {
        const { baseUrl, path } = this.channelContext.ecommerce;
        const codesString = StringUtils.join(codes, '+');
        return `${baseUrl}/${path}/${codesString}/`;
    }
    
    async step2FilesForTitleAndComments(postDay) {
        // ... implementação usando TextFormatter com channelContext
    }
}
```

### Fase 4: TextFormatter Multi-Channel

#### 4.1 Refatorar TextFormatter
```javascript
// src/shared/utils/text-formatter.utils.js
class TextFormatter {
    static formatSocialMediaDescription(title, url, hashtags, platform, channelContext) {
        const socialConfig = channelContext.getSocialMediaConfig(platform);
        const brandHashtag = `#${channelContext.name}`;
        const customHashtags = ['#parceiromagalu', '#achadinhos', '#promo', '#promotion', '#sale'];
        
        switch(platform) {
            case 'youtube':
                return this.formatYoutubeDescription(title, url, hashtags, socialConfig, brandHashtag, customHashtags, channelContext);
            case 'tiktok':
                return this.formatTiktokDescription(title, hashtags, socialConfig, brandHashtag, customHashtags);
            case 'instagram':
                return this.formatInstagramDescription(title, url, hashtags, socialConfig, brandHashtag, customHashtags, channelContext);
            default:
                throw new Error(`Platform ${platform} not supported`);
        }
    }
    
    static formatYoutubeDescription(title, url, hashtags, socialConfig, brandHashtag, customHashtags, channelContext) {
        const titleFormatted = `${title} #shorts da ${socialConfig.handle}\n\n`;
        let description = `Link para os produtos: ${url}\n\n`;
        description += `Siga nossas redes sociais:\n`;
        
        // Links dinâmicos baseados no canal
        Object.entries(channelContext.socialMedia).forEach(([platform, config]) => {
            if (platform !== 'youtube') {
                description += `${platform.charAt(0).toUpperCase() + platform.slice(1)}: ${config.url}\n`;
            }
        });
        
        description += `\n#shorts da ${socialConfig.handle}\n`;
        description += `${[brandHashtag, ...customHashtags, ...hashtags].join(' ')}\n`;
        
        return { title: titleFormatted, description: description.trim() };
    }
}
```

### Fase 5: Factory Pattern

#### 5.1 Criar ServiceFactory
```javascript
// src/shared/factories/service.factory.js
class ServiceFactory {
    static createAdController(channelId) {
        return new Ad(channelId);
    }
    
    static createYoutubeService(channelContext) {
        return new YoutubeService(channelContext);
    }
    
    static createEcommerceService(channelContext, type = 'magazine-luiza') {
        switch(type) {
            case 'magazine-luiza':
                return new MagazineLuizaService(channelContext);
            default:
                throw new Error(`Ecommerce service type ${type} not supported`);
        }
    }
}
```

## 📅 Cronograma de Implementação

### Semana 1: Fundação (8-10 horas)
- [ ] Criar ChannelContext e ChannelsConfig
- [ ] Configurar environment variables
- [ ] Refatorar constants.js para multi-channel

### Semana 2: Services (6-8 horas)
- [ ] Refatorar YoutubeService para multi-channel
- [ ] Criar BaseEcommerceService
- [ ] Refatorar MagazineLuizaService

### Semana 3: Controllers (4-6 horas)
- [ ] Refatorar AdController com injeção de dependência
- [ ] Atualizar VideoService para channelContext
- [ ] Criar ServiceFactory

### Semana 4: TextFormatter (4-5 horas)
- [ ] Refatorar TextFormatter para multi-channel
- [ ] Testar formatação para diferentes canais
- [ ] Documentar novos padrões

### Semana 5: Testes e Deploy (6-8 horas)
- [ ] Testes integrados multi-channel
- [ ] Documentação completa
- [ ] Deploy e validação

## 🧪 Testes Necessários

### 1. Testes Unitários
```javascript
// tests/shared/models/channel-context.test.js
describe('ChannelContext', () => {
    test('deve retornar API key correta por plataforma', () => {
        const context = new ChannelContext(CHANNELS_CONFIG.wedconecta);
        expect(context.getApiKey('youtube')).toBe('wedconecta_youtube_key');
    });
});
```

### 2. Testes de Integração
```javascript
// tests/integration/multi-channel.test.js
describe('Multi-Channel Integration', () => {
    test('deve criar serviços para diferentes canais', () => {
        const wedController = ServiceFactory.createAdController('wedconecta');
        const outroController = ServiceFactory.createAdController('outromarca');
        
        expect(wedController.channelContext.name).toBe('wedconecta');
        expect(outroController.channelContext.name).toBe('outromarca');
    });
});
```

### 3. Testes de Formatação
```javascript
// tests/shared/utils/text-formatter.test.js
describe('TextFormatter Multi-Channel', () => {
    test('deve formatar descrições diferentes por canal', () => {
        const wedContext = new ChannelContext(CHANNELS_CONFIG.wedconecta);
        const outroContext = new ChannelContext(CHANNELS_CONFIG.outromarca);
        
        const wedDesc = TextFormatter.formatSocialMediaDescription(
            'Test', 'http://test.com', '#test', 'youtube', wedContext
        );
        
        const outroDesc = TextFormatter.formatSocialMediaDescription(
            'Test', 'http://test.com', '#test', 'youtube', outroContext
        );
        
        expect(wedDesc.title).toContain('@wedconecta');
        expect(outroDesc.title).toContain('@outromarca');
    });
});
```

## 📋 Checklist de Implementação

### Pré-Implementação
- [ ] Backup completo do código atual
- [ ] Documentar estrutura atual
- [ ] Criar branch para implementação

### Implementação
- [ ] Criar estrutura de arquivos nova
- [ ] Implementar ChannelContext
- [ ] Configurar environment variables
- [ ] Refatorar services um por um
- [ ] Refatorar controllers
- [ ] Refatorar TextFormatter
- [ ] Criar factory pattern

### Pós-Implementação
- [ ] Testes completos
- [ ] Documentação atualizada
- [ ] Migration guide
- [ ] Performance validation

## 🚀 Benefícios Esperados

### 1. **Escalabilidade**
- Suporte para infinitos canais
- Configurações isoladas
- Fácil expansão

### 2. **Manutenibilidade**
- Código reutilizável
- Configurações centralizadas
- Padrões consistentes

### 3. **Segurança**
- API keys isoladas
- Environment variables específicas
- Contexto seguro

### 4. **Performance**
- Cache por canal
- Lazy loading de configurações
- Otimizações específicas

## 📊 Métricas de Sucesso

- **Tempo de implementação**: 28-37 horas
- **Cobertura de testes**: >90%
- **Performance**: <100ms para inicialização
- **Escalabilidade**: Suporte para 100+ canais
- **Manutenibilidade**: <2 horas para novo canal

## ⚠️ Pontos Críticos que Merecem Atenção Antes de Implementar

### 🚨 **Análise de Impacto e Riscos**

#### 1. **Compatibilidade com Código Existente**
- **Risco**: Quebra de funcionalidades atuais
- **Análise necessária**: Mapear todas as dependências do sistema atual
- **Ponto crítico**: AdController é usado por múltiplos fluxos

#### 2. **Performance e Memória**
- **Risco**: Carregamento de múltiplos contextos pode impactar performance
- **Análise necessária**: Benchmark de memória vs. contexto único
- **Ponto crítico**: ChannelContext por instância vs. singleton

#### 3. **Segurança de API Keys**
- **Risco**: Exposição acidental de chaves entre canais
- **Análise necessária**: Validação de isolamento completo
- **Ponto crítico**: Environment variables em produção

#### 4. **Migração de Dados**
- **Risco**: Perda de configurações atuais
- **Análise necessária**: Estratégia de migração gradual
- **Ponto crítico**: Configurações existentes em constants.js

### 🔍 **Análise Técnica Profunda Necessária**

#### 1. **Dependências Circulares**
```javascript
// RISCO POTENCIAL
ChannelContext → Services → ChannelContext
// Análise necessária: Mapear grafo de dependências
```

#### 2. **Estado Compartilhado**
```javascript
// RISCO POTENCIAL
static methods em services vs. instâncias por canal
// Análise necessária: Identificar estado compartilhado
```

#### 3. **Concorrência e Race Conditions**
```javascript
// RISCO POTENCIAL
Múltiplos canais acessando mesmos recursos
// Análise necessária: Estratégia de isolamento
```

#### 4. **Cache e Persistência**
```javascript
// RISCO POTENCIAL
Cache por canal vs. cache global
// Análise necessária: Estratégia de cache multi-tenant
```

### 📋 **Validações Obrigatórias Antes do Start**

#### 1. **Análise de Arquitetura**
- [ ] Mapear completo de dependências atuais
- [ ] Identificar pontos de falha crítica
- [ ] Validar arquitetura proposta vs. necessidades reais

#### 2. **Proof of Concept (PoC)**
- [ ] Implementar ChannelContext mínimo
- [ ] Testar com 2 canais simulados
- [ ] Validar performance e memória

#### 3. **Plano de Rollback**
- [ ] Estratégia de volta ao sistema atual
- [ ] Backup automatizado de configurações
- [ ] Testes de rollback completos

#### 4. **Análise de Segurança**
- [ ] Validação de isolamento de API keys
- [ ] Testes de vazamento de dados entre canais
- [ ] Análise de permissões e access controls

### 🎯 **Decisões Críticas a Tomar**

#### 1. **Estratégia de Migração**
```javascript
// OPÇÃO A: Big Bang (risco alto)
// Migrar tudo de uma vez

// OPÇÃO B: Gradual (recomendado)
// 1. Implementar ChannelContext paralelo
// 2. Migrar service por service
// 3. Manter compatibilidade durante transição

// OPÇÃO C: Feature Flag
// Implementar com flag para ativação gradual
```

#### 2. **Gerenciamento de Estado**
```javascript
// OPÇÃO A: Stateless (recomendado)
// Cada instância com seu contexto

// OPÇÃO B: Singleton com contexto
// Gerenciador central de contextos

// OPÇÃO C: Factory pattern
// Criar instâncias sob demanda
```

#### 3. **Configurações Dinâmicas**
```javascript
// OPÇÃO A: Runtime (flexível)
// Carregar configurações dinamicamente

// OPÇÃO B: Startup (performance)
// Carregar tudo na inicialização

// OPÇÃO C: Hybrid (recomendado)
// Configurações básicas no startup, dinâmicas sob demanda
```

### 🚨 **Sinais de Alerta (Stop Conditions)**

#### 1. **Parar se:**
- Performance > 200ms para inicialização
- Uso de memória > 50% aumento
- Qualquer vazamento de dados entre canais
- Quebra de funcionalidades críticas existentes

#### 2. **Reavaliar se:**
- Complexidade > 2x implementação atual
- Tempo de implementação > 50 horas
- Requer mudanças em infraestrutura

#### 3. **Prosseguir apenas se:**
- PoC bem-sucedido com 2+ canais
- Performance dentro de limites aceitáveis
- Segurança validada completamente
- Rollback testado e funcionando

### 📊 **Métricas de Sucesso Revisadas**

#### 1. **Técnicas**
- Performance: <100ms inicialização (antes: <50ms)
- Memória: <20% aumento (antes: 0%)
- Complexidade: <2x atual (antes: 1x)

#### 2. **Funcionais**
- Suporte para 10+ canais (mínimo)
- 0 vazamento de dados entre canais
- 100% compatibilidade com features atuais

#### 3. **Operacionais**
- Tempo para novo canal: <2 horas
- Documentação completa
- Monitoramento por canal implementado

## 🎯 Conclusão

Esta implementação transformará o sistema single-tenant atual em uma arquitetura multi-tenant robusta, escalável e segura, permitindo suporte a múltiplos canais com mínimo esforço de configuração e máximo reaproveitamento de código.

**Status**: ⚠️ **Requer análise detalhada antes de implementação**

**Ação recomendada**: Realizar PoC completo e validação de todos os pontos críticos antes do início da implementação.
