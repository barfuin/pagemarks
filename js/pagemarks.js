'use strict';

exports.pagemarksMain = function () {

    var Shuffle = window.Shuffle;
    var element = document.querySelector('.pagemarks-shuffle-container');

    const shuffleInstance = new Shuffle(element, {
        itemSelector: '.pagemarks-item',
        sizer: '.pagemarks-shuffle-container:first-child'
    });
    shuffleInstance.options.filterMode = Shuffle.FilterMode.ALL; // combine tags with AND

    const inputForm = $('#pagemarks-filter');
    inputForm.on('submit', null, shuffleInstance, updateFilter);
}



function updateFilter(event) {
    event.preventDefault();
    const s = getValueFromInput('pagemarks-filter input', Shuffle.ALL_ITEMS);
    console.log("filter changed - " + s);
    if (s.indexOf(' ') !== -1) {
        const t = s.split(' ');
        event.data.filter(t);
    } else {
        event.data.filter(s);
    }
    return false;
}

function getValueFromInput(pInputFieldName, pDefault) {
    let result = pDefault;
    const v = $('#' + pInputFieldName).val();
    if (typeof (v) === 'string' && v.trim().length > 0) {
        result = v.trim();
    }
    return result;
}


const ParserState = Object.freeze({'NEUTRAL':1, 'WORD': 2, 'QUOTED':3, 'TAG':4});

exports.parseQuery = function (pQuery) {
    let result = {'words': [], 'tags': []};
    if (typeof(pQuery) !== 'undefined' && pQuery !== null) {
        if (typeof(pQuery) === 'string' && pQuery.trim().length > 0) {
            result = pq(pQuery.trim());
        }
    }
    result.isEmpty = result.words.isEmpty && result.tags.isEmpty;
    return Object.freeze(result);
}

function pq(pString) {
    let parserState = ParserState.NEUTRAL;
    let currentTerm = '';
    const result = {'words': [], 'tags': []};

    for (let pos = 0; pos < pString.length; pos++)
    {
        const c = pString[pos];
        if (parserState === ParserState.NEUTRAL) {
            if (c === '"') {
                parserState = ParserState.QUOTED;
            }
            else if (c === '[') {
                parserState = ParserState.TAG;
            }
            else if (c !== ' ' && c !== '\t') {
                parserState = ParserState.WORD;
                currentTerm += c;
            }
        }
        else if (parserState === ParserState.WORD) {
            if (c !== ' ' && c !== '\t') {
                currentTerm += c;
            } else {
                if (currentTerm.length > 0) {
                    result.words.push(currentTerm);
                    currentTerm = '';
                }
                parserState = ParserState.NEUTRAL;
            }
        }
        else if (parserState === ParserState.QUOTED) {
            if (isClosingQuote(pString, pos)) {
                if (currentTerm.length > 0) {
                    result.words.push(currentTerm);
                    currentTerm = '';
                }
                parserState = ParserState.NEUTRAL;
            }
            else {
                currentTerm += c;
            }
        }
        else if (parserState === ParserState.TAG) {
            if (c === ']') {
                if (currentTerm.length > 0) {
                    result.tags.push(currentTerm);
                    currentTerm = '';
                }
                parserState = ParserState.NEUTRAL;
            }
            else {
                currentTerm += c;
            }
        }
        else {
            throw new Error('Unknown parser state: ' + parserState);
        }
    }
    if (currentTerm.length > 0) {
        result.words.push(currentTerm);
    }
    return result;
}


function isClosingQuote(pString, pPos) {
    let result = false;
    if (pString[pPos] === '"') {
        let bsCount = 0;
        for(let p = pPos - 1; p >= 0; p--) {
            if (pString[p] === '\\') {
                bsCount++;
            } else {
                break;
            }
        }
        if (bsCount % 2 === 0) {   // quote is not escaped
            if (pPos === pString.length - 1) {
                result = true;
            } else {
                const c = pString[pPos + 1];
                if (c === ' ' || c === '\t') {
                    result = true;
                }
            }
        }
    }
    return result;
}
