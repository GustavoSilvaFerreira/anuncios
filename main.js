require('dotenv').config();
const { Ad } = require('./src');
const { FILE_DATE_FIRST_POST } = require('./src/config/directory.config');
const { File } = require('./src/modules/storage');
const dateFirstPostTxt = File.getFileContentSync(FILE_DATE_FIRST_POST);
const [day, month, year] = dateFirstPostTxt.split('/').map(Number);

(async () => {
    const adverts = new Ad();
    const dateFirstPost = {
        day,
        month,
        year
    }
    try {
        // FLUXO ORIGINAL + UPLOAD E AGENDAMENTO YOUTUBE
        console.log(' Iniciando fluxo completo com upload e agendamento...');
        
        // 1. Criar vídeos (fluxo original)
        console.log(' Etapa 1: Criando vídeos...');
        const postDay = await adverts.step1FilesForCreateVideos(dateFirstPost);
        
        // 2. Fazer upload e agendamento para YouTube
        console.log(' Etapa 2: Upload e agendamento no YouTube...');
        
        // Ler o postDay criado pelo step1 (arquivo JSON)
        const fs = require('fs');
        const path = require('path');
        const { DIR_TO_CREATE } = require('./src/config/directory.config');
        
        const datePost = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const postJsonPath = path.join(DIR_TO_CREATE, datePost, 'for-create-post-Ad.json');
        
        // if (!fs.existsSync(postJsonPath)) {
        //     console.error(' Arquivo postDay não encontrado:', postJsonPath);
        //     process.exit(1);
        // }
        
        // const postDay = JSON.parse(fs.readFileSync(postJsonPath, 'utf8'));
        console.log(` PostDay com ${postDay.posts.length} posts`);
        
        // Agendar vídeos baseado na data do post (29/04/2026)
        const result = await adverts.scheduleVideosFromPostDay(postDay);
        
        console.log(' Upload e agendamento concluídos!');
        console.log(` Data base: ${result.baseDate}`);
        console.log(` Vídeos agendados: ${result.scheduled}`);
        console.log(` Sucesso: ${result.success}`);
        
        process.exit(0);
    } catch (error) {
        console.error(' Erro fatal:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
})();

// const VideoService = require('./services/video.service');
// const videoService = new VideoService();
// videoService.teste();

// const YoutubeService = require('./services/youtube.service');
// const youtubeService = new YoutubeService();
// youtubeService.search('');