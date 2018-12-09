// node js script
// Add a bookmark to your pagemarks.io collection

// 1 parameter (the new url)
// possibly a 2nd for the collection

// take password from git config (pagemarks.repo.pass or smth)
// update the repo
// curl the url
// parse title, description from the result
// generate yaml paragraph
// append to yaml file
// git diff and ask for confirmation (optional)
// git push

const cheerio = require('cheerio');
const request = require('request');
const yaml = require('js-yaml');
const he = require('he');

function date2yaml(pDate) {
    const d = pDate.getDate();
    const m = pDate.getMonth() + 1;
    const y = pDate.getFullYear();
    const h = pDate.getHours();
    const min = pDate.getMinutes();
    const s = pDate.getSeconds();
    return y + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d) + ' ' +
        (h < 10 ? '0' + h : h) + ':' + (min < 10 ? '0' + min : min) + ':' + (s < 10 ? '0' + s : s);
}

// const url = 'https://thomasjensen.com';
const url = 'http://www.spamfence.net/';

request({
    url: url,
    encoding: null
}, function (error, response, body) {

    const $ = cheerio.load(body, {
        lowerCaseTags: true,
        lowerCaseAttributeNames: true
    });

    const desc = $('meta').filter(function (idx, elem) {
        return 'name' in elem.attribs && $(elem).attr('name').match(/^description$/i);
    });

    const dateFormatted = date2yaml(new Date());

    const outObj = {
        name: he.decode($('title').html()),
        url: url,
        tags: [],
        date_added: dateFormatted
    };
    if (desc.length > 0) {
        outObj.notes = he.decode(desc.attr('content'), {
            'isAttributeValue': false
        });
    }

    const outYaml = '  -' + yaml.safeDump(outObj, {
        indent: 4,
        lineWidth: 118,
        noRefs: true
    }).replace(/^/gm, '    ').substring(3);
    console.log(outYaml);
});