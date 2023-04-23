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
const path = require('path');
const parseString = require('xml2js').parseString;

if (!fs.existsSync('data')) {
    fs.mkdirSync('data');
}

const PAGE_URL = 'https://tai-studio.netlify.app';
const device = 'desktop'; // mobile or desktop

if (process.env.WORKFLOW_INPUT != null) {
    var tmp = JSON.parse(process.env.WORKFLOW_INPUT);
    process.env.websiteURL = tmp.websiteURL;
    process.env.width = tmp.width;
    process.env.height = tmp.height;

    console.log('Run With Github Action !');
}

init();
async function init() {
    var urls = await getSitemapLinks(`${PAGE_URL}/sitemap.xml`);
    urls.forEach((val, index) => {
        var current = val.split('/');
            current = current.pop();

            current = val.replace('http://', '');
            current = current.replace('https://', '');
        createDirectory(`./data/${current}`);

        setTimeout(() => {
            axios.get(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${val}&strategy=${device}`)
                .then(function (response) {
                    if(current == ''){
                        current = 'index';
                    }
                    fs.writeFileSync(`./data/${current}.txt`, JSON.stringify(response.data, null, 2));
                })
                .catch(function (error) {
                    console.log('Error get');
                    console.log(error);
                });
        }, index * 10000);
    });
}

function createDirectory(folderPath) {
    const normalizedPath = path.normalize(folderPath);

    if (!fs.existsSync(normalizedPath)) {
        fs.mkdirSync(normalizedPath, { recursive: true });
        console.log(`Created directory: ${normalizedPath}`);
    } else {
        console.log(`Directory already exists: ${normalizedPath}`);
    }
}

async function getSitemapLinks(url) {
    try {
        const response = await axios.get(url);
        const xml = response.data;
        let links = [];

        parseString(xml, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                links = result.urlset.url.map(url => url.loc[0]);
            }
        });

        return links;
    } catch (error) {
        console.log(error);
    }
}