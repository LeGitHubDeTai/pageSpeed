/*-------------------------------------------------------------------------------------------------------------\
|  _______    _    _____ _             _ _           ________     ___   ___ ___  __     _____   ___ ___  ___   |
| |__   __|  (_)  / ____| |           | (_)         /  ____  \   |__ \ / _ \__ \/_ |   / /__ \ / _ \__ \|__ \  |
|    | | __ _ _  | (___ | |_ _   _  __| |_  ___    /  / ___|  \     ) | | | | ) || |  / /   ) | | | | ) |  ) | |
|    | |/ _` | |  \___ \| __| | | |/ _` | |/ _ \  |  | |       |   / /| | | |/ / | | / /   / /| | | |/ /  / /  |
|    | | (_| | |  ____) | |_| |_| | (_| | | (_) | |  | |___    |  / /_| |_| / /_ | |/ /   / /_| |_| / /_ / /_  |
|    |_|\__,_|_| |_____/ \__|\__,_|\__,_|_|\___/   \  \____|  /  |____|\___/____||_/_/   |____|\___/____|____| |
|                                                   \________/                                                 |
\-------------------------------------------------------------------------------------------------------------*/
const axios = require('axios');
require('dotenv').config();
const fs = require('fs');

if (!fs.existsSync('data')) {
    fs.mkdirSync('data');
}

const PAGE_URL = 'https://tai-studio.netlify.app';
const device = 'desktop'; // mobile or desktop
const API = '';

if (process.env.WORKFLOW_INPUT != null) {
    var tmp = JSON.parse(process.env.WORKFLOW_INPUT);
    process.env.websiteURL = tmp.websiteURL;
    process.env.width = tmp.width;
    process.env.height = tmp.height;

    console.log('Run With Github Action !');
}

axios.get(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${PAGE_URL}&strategy=${device}`)
    .then(function (response) {
        fs.writeFileSync('./data/get.txt', JSON.stringify(response.data, null, 2));
    })
    .catch(function (error) {
        console.log('Error get');
        console.log(error);
    });

axios.post(`https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${API}`, {
    url: PAGE_URL
}, {
    headers: {
        'Content-Type': 'application/json'
    }
})
    .then(function (response) {
        fs.writeFileSync('./data/post.txt', JSON.stringify(response.data, null, 2));
    })
    .catch(function (error) {
        console.log(error);
        fs.writeFileSync('./data/post.txt', JSON.stringify(error, null, 2));
    });