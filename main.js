/*-----------------------------------------------------------------------------------------------------------\
|  _____     _   _____ _             _ _          _____  _____  _____  __      _______  _____  _____  _____  |
| |_   _|   (_) /  ___| |           | (_)        / __  \|  _  |/ __  \/  |    / / __  \|  _  |/ __  \|____ | |
|   | | __ _ _  \ `--.| |_ _   _  __| |_  ___    `' / /'| |/' |`' / /'`| |   / /`' / /'| |/' |`' / /'    / / |
|   | |/ _` | |  `--. \ __| | | |/ _` | |/ _ \     / /  |  /| |  / /   | |  / /   / /  |  /| |  / /      \ \ |
|   | | (_| | | /\__/ / |_| |_| | (_| | | (_) |  ./ /___\ |_/ /./ /____| |_/ /  ./ /___\ |_/ /./ /___.___/ / |
|   \_/\__,_|_| \____/ \__|\__,_|\__,_|_|\___/   \_____/ \___/ \_____/\___/_/   \_____/ \___/ \_____/\____/  |
\-----------------------------------------------------------------------------------------------------------*/
const axios = require('axios');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const parseString = require('xml2js').parseString;

if (!fs.existsSync('data')) {
    fs.mkdirSync('data');
}

var PAGE_URL = 'https://tai-studio.netlify.app';
var device = 'desktop'; // mobile or desktop

if (process.env.WORKFLOW_INPUT != null) {
    var tmp = JSON.parse(process.env.WORKFLOW_INPUT);

    PAGE_URL = tmp.websiteURL;
    device = tmp.device;
    console.log('Run With Github Action !');
}

init();
async function init() {
    var urls = await getSitemapLinks(`${PAGE_URL}/sitemap.xml`);
        urls = removeDuplicates(urls);
    for (let i = 0; i < urls.length; i++) {
        const val = urls[i];
        var current = val.split('/');
        current = current.pop();

        current = val.replace('http://', '');
        current = current.replace('https://', '');
        createDirectory(`./data/${current}`);

        await new Promise(resolve => setTimeout(resolve, 95000));
        axios.get(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${val}&strategy=${device}`)
            .then(function (response) {
                if (current == '') {
                    current = 'index';
                }
                if (current == null) {
                    current = 'index';
                }
                fs.writeFileSync(`./data/${current}.json`, JSON.stringify(response.data, null, 2));
            })
            .catch(function (error) {
                console.log('Error get');
                if (error.response.data != null) {
                    console.log(error.response.data);
                    fs.writeFileSync(`./data/${current}_ERROR.json`, JSON.stringify(error.response.data, null, 2));
                }
                else {
                    console.log(error);
                    fs.writeFileSync(`./data/${current}_ERROR.json`, JSON.stringify(error, null, 2));
                }
            });
    }

    deleteEmptyFoldersRecursively('./data');
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

function deleteEmptyFoldersRecursively(folderPath) {
    if (!fs.existsSync(folderPath)) {
        return;
    }

    const files = fs.readdirSync(folderPath);
    if (files.length > 0) {
        files.forEach(function (file) {
            const fullPath = folderPath + '/' + file;
            if (fs.statSync(fullPath).isDirectory()) {
                deleteEmptyFoldersRecursively(fullPath);
            }
        });

        // Re-check the folder after deleting the files
        const filesAfterDeletion = fs.readdirSync(folderPath);
        if (filesAfterDeletion.length === 0) {
            fs.rmdirSync(folderPath);
            console.log(`Deleted empty folder: ${folderPath}`);
        }
    } else {
        fs.rmdirSync(folderPath);
        console.log(`Deleted empty folder: ${folderPath}`);
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

function removeDuplicates(array) {
    return [...new Set(array)];
}
