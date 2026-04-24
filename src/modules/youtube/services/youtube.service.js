const RestService = require('../../storage/services/rest.service');
const ENDPOINTS = require('../../../config/url.config');
const CoffeScript = require('coffee-script');
CoffeScript.register();
const gapi = require('gapi');

const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');

class YoutubeService {
    restService = null;
    key = 'AIzaSyByqLOnEftpOkSSfxNgnLNQllV1DuNwO2Q';

    constructor(
        restService = new RestService()
    ) {
        this.restService = restService;
    }

    async teste() {
        const youtube = google.youtube({
            version: 'v3',
            auth: this.key
        });
        await youtube.videos.list({
            part: 'id,status,contentDetails,snippet',
            id: 'Q_iF8J1-b3g',
        }).then(res => {
            console.log(res.data.items);
        })
    }

    async search(search) {
        this.teste().catch(console.error);
        return
    }
}

module.exports = YoutubeService;