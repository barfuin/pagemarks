/*
 * pagemarks - Self-hosted static bookmarks via GitHub Pages and Jekyll
 * Copyright (c) 2019 the pagemarks contributors
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
const packageJson = require('../package.json');
const path = require('path');
const shared = require('./shared');
const yaml = require('js-yaml');


cmdline
    .usage('[options] <nbmFile> [ymlOutFile]')
    .description('Convert a Netscape Bookmark File into a pagemarks collection')
    .option('-p, --include-private', 'Include bookmarks flagged as \'private\'')
    .version('pagemarks.io v' + packageJson.version, '-v, --version')
    .arguments('<nbmIn> [ymlOut]')
    .action(function(nbmIn, ymlOut) {
        passedNbmInputFile = nbmIn;
        convert(nbmIn, ymlOut);
    })
    .parse(process.argv);

if (!process.argv.slice(2).length) {
    cmdline.help();
}
if (typeof passedNbmInputFile === 'undefined') {
    console.error('ERROR: no Netscape Bookmarks File specified');
    process.exit(1);
}


function convert(inNbmHtmlFile, outYamlFile) {
    const bmArray = [];
    const $ = readInput(inNbmHtmlFile);
    $('a').each(function(index, a) {
        const raw = parseRawRecordFromHtml($(a));
        if (canBeIncluded(raw, cmdline.includePrivate)) {
            const bookmark = createBookmark(raw);
            bmArray.push(bookmark)
        }
    });
    const outYaml = convertToYaml(bmArray, inNbmHtmlFile);
    writeOutput(outYamlFile, outYaml);
}


function readInput(pInNbmHtmlFile) {
    return cheerio.load(fs.readFileSync(path.resolve(__dirname, pInNbmHtmlFile)), {
        'lowerCaseTags': true,
        'lowerCaseAttributeNames': true
    });
}


function parseRawRecordFromHtml(htmlAnchor) {
    const name = htmlAnchor.text();
    const url = htmlAnchor.attr('href');
    const add_date = htmlAnchor.attr('add_date');
    const notes = htmlAnchor.parent().next('dd').text().split("\n")[0];
    const privateFlag = htmlAnchor.attr('private');
    const tagStr = htmlAnchor.attr('tags');
    var tags = [];
    if (isPresent(tagStr)) {
        try {
            tags = tagStr.trim().split(/\s*,\s*|\s+/).filter(skippedTags) || [];
        } catch (e) {
            tags = [];
        }
    }
    const rawRecord = { name, url, privateFlag, tags, add_date, notes };
    return rawRecord;
}


function skippedTags(pParsedTag) {
    if (pParsedTag === 'system:unfiled') { // tags that should be ignored
        return undefined;
    }
    return pParsedTag;
}


function canBeIncluded(pRaw, pIncludePrivate) {
    return isPresent(pRaw.url) && (pIncludePrivate || pRaw.privateFlag == false);
}


function createBookmark(pRaw) {
    const bookmark = {};
    if (isPresent(pRaw.name)) {
        bookmark.name = pRaw.name;
    }
    bookmark.url = pRaw.url;
    bookmark.tags = pRaw.tags;
    if (isPresent(pRaw.add_date)) {
        bookmark.date_added = shared.date2yaml(secsToDate(pRaw.add_date));
    }
    if (isPresent(pRaw.notes)) {
        bookmark.notes = pRaw.notes;
    }
    return bookmark;
}


function convertToYaml(pBookmarkArray, pInNbmHtmlFile) {
    const outObj = {
        'pinned-filters': [],
        'bookmarks': pBookmarkArray
    };
    const outYaml = '# Bookmarks from Netscape Bookmark File: ' + pInNbmHtmlFile + '\n---\n\n'
        + '# The entries of the \'Pinned\' dropdown, so you don\'t have to type it into the \'Filter\' box '
        + 'every time\n'
        + yaml.safeDump(outObj, {
            'flowLevel': 3,
            'indent': 2,
            'lineWidth': 118,
            'noRefs': true
        }).replace(/^  - name:/gm, '\n  - name:').replace(/^bookmarks:\n\n/m, '\nbookmarks:\n');
    return outYaml;
}


function writeOutput(pOutYamlFile, pContent) {
    if (typeof(pOutYamlFile) === 'undefined') {
        console.log(pContent);
    } else {
        fs.writeFileSync(path.resolve(__dirname, pOutYamlFile), pContent);
    }
}


function isPresent(s) {
    return typeof s !== 'undefined' && s !== null && s.trim().length > 0;
}


function secsToDate(secs) {
    const result = new Date(0); // epoch
    result.setSeconds(parseInt(secs));
    return result;
}
