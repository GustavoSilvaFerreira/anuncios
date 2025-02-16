const RestService = require('./rest.service');
const ENDPOINTS = require('../core/url.config');
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

    // async teste() {
    //     const auth = new GoogleAuth({
    //         credentials: {
    //             client_secret: this.key
    //         },
    //         scopes: 'https://www.googleapis.com/auth/cloud-platform'
    //     });
    //     const client = await auth.getClient();
    //     const projectId = await auth.getProjectId();
    //     const url = `https://dns.googleapis.com/dns/v1/projects/${projectId}`;
    //     const res = await client.request({ url });
    //     console.log(res.data);
    // }
    async teste() {
        // const blogger = google.blogger({
        //     version: 'v3',
        //     auth: this.key
        //   });
        // console.log(blogger.context.google.youtube);
        const youtube = google.youtube({
            version: 'v3',
            auth: this.key
        });
        // await youtube.playlists.list({
        //     // key: this.key,
        //     part: 'id',
        //     channelId: 'UCEsHJAZezJSuOUEqLJ3t2dg'
        // }).then(res => {
        //     console.log(res.data.items);
        // })
        await youtube.videos.list({
            // key: this.key,
            part: 'id,status,contentDetails,snippet',
            id: 'Q_iF8J1-b3g',
            // channelId: 'UCEsHJAZezJSuOUEqLJ3t2dg'
        }).then(res => {
            console.log(res.data.items);
        })
    }

    async search(search) {
        this.teste().catch(console.error);
        return
        // gapi.client.init({
        //     apiKey: this.key
        // })
        // .then(() => {
        //     console.log('teste');
        // });
        // const x = new gapi()
        console.log(gapi);
        gapi.client.init({
            apiKey: this.key
        });
        // gapi.server.setApiKey(this.key);
        // gapi.server.load(`https://www.googleapis.com/youtube`, `v3`);
        // console.log(gapi.server.plus.activities.list());
        // gapi.server.plus.activities.list
        // var request = gapi.client.youtube.channels.list({
        //     mine: true,
        //     part: 'contentDetails'
        //   });
        //   request.execute(function(response) {
        //     playlistId = response.result.items[0].contentDetails.relatedPlaylists.uploads;
        //     requestVideoPlaylist(playlistId);
        //   });
        // gapi.client.request({
        //     path: 'v3/videos',
        //     method: 'GET',
        //     params: {
        //         key: 'AIzaSyByqLOnEftpOkSSfxNgnLNQllV1DuNwO2Q'
        //     }
        // }).then(function (resp) {
        //     console.log(resp.result);
        // });
    }
}

module.exports = YoutubeService;