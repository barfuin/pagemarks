'use strict';

var expect    = require("chai").expect;
var pagemarks = require("../js/pagemarks");
require('mocha');

describe('parseQuery() function', () => {

    it('should handle empty input', () => {
        const result = pagemarks.parseQuery('');
        expect(result).to.deep.equal([]);
    });

    /*
    it('foo bar boo', () => {
        const result: string[][] = underTest['powerSet'](['foo', 'bar', 'baz']);
        expect(result[0]).to.have.lengthOf(0);
        expect(result[result.length - 1]).to.have.lengthOf(3);
    }); */
});