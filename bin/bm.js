/*
 * pagemarks - Self-hosted static bookmarks via GitHub Pages and Jekyll
 * Copyright (c) 2019 Thomas Jensen
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public
 * License, version 3, as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/gpl.html>.
 */

const cheerio = require('cheerio');
const cmdline = require('commander');
const fs = require('fs');
const he = require('he');
const packageJson = require('../package.json');
const request = require('request');
const shared = require('./shared');
const yaml = require('js-yaml');

// - take password from git config (pagemarks.repo.pass or smth)
// - update the repo
// - curl the url ✓
// - parse title, description from the result ✓
// - generate yaml paragraph ✓
// - append to yaml file
// - git diff and ask for confirmation (optional)
// - git push

cmdline
    .usage('[options] <url>')
    .description('Add a bookmark to your pagemarks collection')
    .option('-c, --collection <name>', 'Add the bookmark to the specified collection', 'bookmarks')
    .option('-d, --dry-run', 'Do not change any files, just show the bookmark entry on the console')
    .version('pagemarks.io v' + packageJson.version, '-v, --version')
    .arguments('<url>')
    .action(function(pUrl) {
        passedUrl = pUrl;
        addBookmark(pUrl);
    })
    .parse(process.argv);

if (!process.argv.slice(2).length) {
    cmdline.help();
}
if (typeof passedUrl === 'undefined') {
    console.error('ERROR: no bookmark URL specified');
    process.exit(1);
}


function addBookmark(pUrl) {
    fetchHtml(pUrl, function(error, response, body) {
        if (error) {
            handleFetchError(pUrl, error);
        }
        const bookmark = parseHtml(pUrl, body);
        storeBookmark(bookmark);
    });
}


function fetchHtml(pUrl, pCallback) {
    const options = {
        'url': pUrl,
        'encoding': null
    };
    console.log('Retrieving ' + pUrl + ' ...');
    request(pUrl, options, pCallback);
}


function handleFetchError(pUrl, pError) {
    if (pError) {
        if (pError.code === 'ENOTFOUND') {
            console.error("URL not found: " + pUrl);
        } else {
            console.error('Retrieval failed: ', pError);
        }
        process.exit(2);
    }
}


function parseHtml(pUrl, pHtml) {
    const $ = cheerio.load(pHtml, {
        'lowerCaseTags': true,
        'lowerCaseAttributeNames': true
    });

    const name = he.decode($('title').html());
    const desc = $('meta').filter(function(idx, elem) {
        return 'name' in elem.attribs && $(elem).attr('name').match(/^description$/i);
    });
    const dateFormatted = shared.date2yaml(new Date());

    const bookmark = {
        'name': name,
        'url': pUrl,
        'tags': [],
        'date_added': dateFormatted
    };
    if (desc.length > 0) {
        bookmark.notes = he.decode(desc.attr('content'), {
            'isAttributeValue': false
        });
    }
    return bookmark;
}


function storeBookmark(pBookmark) {
    const outYaml = '  -' + yaml.safeDump(pBookmark, {
        indent: 4,
        lineWidth: 118,
        noRefs: true
    }).replace(/^/gm, '    ').substring(3);

    if (cmdline.dryRun) {
        console.log(outYaml);
    } else {
        //fs.appendFileSync('../_data/' + cmdline.collection + '.yml', '\n' + outYaml);
    }
}
