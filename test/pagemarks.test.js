'use strict';

var expect = require("chai").expect;
var pagemarks = require("../js/pagemarks");
require('mocha');

describe('parseQuery() function', () => {

    it('should handle empty input', () => {
        let result = pagemarks.parseQuery('');
        expect(result).to.not.be.null;
        expect(result.words).to.deep.equal([]);
        expect(result.tags).to.deep.equal([]);

        result = pagemarks.parseQuery(' ');
        expect(result).to.not.be.null;
        expect(result.words).to.deep.equal([]);
        expect(result.tags).to.deep.equal([]);

        result = pagemarks.parseQuery(' \t ');
        expect(result).to.not.be.null;
        expect(result.words).to.deep.equal([]);
        expect(result.tags).to.deep.equal([]);

        result = pagemarks.parseQuery('\t');
        expect(result).to.not.be.null;
        expect(result.words).to.deep.equal([]);
        expect(result.tags).to.deep.equal([]);

        result = pagemarks.parseQuery(null);
        expect(result).to.not.be.null;
        expect(result.words).to.deep.equal([]);
        expect(result.tags).to.deep.equal([]);

        result = pagemarks.parseQuery(undefined);
        expect(result).to.not.be.null;
        expect(result.words).to.deep.equal([]);
        expect(result.tags).to.deep.equal([]);
    });


    it('should treat a single character as one short word', () => {
        let result = pagemarks.parseQuery('x');
        expect(result).to.not.be.null;
        expect(result.words).to.deep.equal(['x']);
        expect(result.tags).to.deep.equal([]);
    });


    it('should recognize a simple, single word', () => {
        let result = pagemarks.parseQuery('foo');
        expect(result).to.not.be.null;
        expect(result.words).to.deep.equal(['foo']);
        expect(result.tags).to.deep.equal([]);

        result = pagemarks.parseQuery('foo   ');
        expect(result).to.not.be.null;
        expect(result.words).to.deep.equal(['foo']);
        expect(result.tags).to.deep.equal([]);

        result = pagemarks.parseQuery('    foo');
        expect(result).to.not.be.null;
        expect(result.words).to.deep.equal(['foo']);
        expect(result.tags).to.deep.equal([]);
    });


    it('should treat quoted words as one', () => {
        let result = pagemarks.parseQuery('"foo bar"');
        expect(result).to.not.be.null;
        expect(result.words).to.deep.equal(['foo bar']);
        expect(result.tags).to.deep.equal([]);
    });


    it('should handle mixture of tags and words', () => {
        let result = pagemarks.parseQuery('"foo" "bar boo" [tag1]word [tag2] bar');
        expect(result).to.not.be.null;
        expect(result.words).to.deep.equal(['foo', 'bar boo', 'word', 'bar']);
        expect(result.tags).to.deep.equal(['tag1', 'tag2']);
    });


    it('treats closing tag bracket as word boundary ', () => {
        let result = pagemarks.parseQuery('foo [tag]bar');
        expect(result).to.not.be.null;
        expect(result.words).to.deep.equal(['foo', 'bar']);
        expect(result.tags).to.deep.equal(['tag']);
    });

    // TODO many more test cases, for example about escaping and incomplete input
});
