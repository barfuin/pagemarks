'use strict';

var expect = require("chai").expect;
var pagemarks = require("../js/pagemarks");
require('mocha');


describe('The parseQuery() function', () => {

    it('handles empty input', () => {
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
    });


    it('handles null and undefined input', () => {
        let result = pagemarks.parseQuery(null);
        expect(result).to.not.be.null;
        expect(result.words).to.deep.equal([]);
        expect(result.tags).to.deep.equal([]);

        result = pagemarks.parseQuery(undefined);
        expect(result).to.not.be.null;
        expect(result.words).to.deep.equal([]);
        expect(result.tags).to.deep.equal([]);
    });


    it('treats a single character as one short word', () => {
        let result = pagemarks.parseQuery('x');
        expect(result).to.not.be.null;
        expect(result.words).to.deep.equal(['x']);
        expect(result.tags).to.deep.equal([]);
    });


    it('recognizes a simple, single word', () => {
        let result = pagemarks.parseQuery('foo');
        expect(result).to.not.be.null;
        expect(result.words).to.deep.equal(['foo']);
        expect(result.tags).to.deep.equal([]);
    });


    it('ignores leading and trailing whitespace', () => {
        let result = pagemarks.parseQuery('foo   ');
        expect(result).to.not.be.null;
        expect(result.words).to.deep.equal(['foo']);
        expect(result.tags).to.deep.equal([]);

        result = pagemarks.parseQuery('    foo');
        expect(result).to.not.be.null;
        expect(result.words).to.deep.equal(['foo']);
        expect(result.tags).to.deep.equal([]);
    });


    it('treats quoted words as one, even if it contains whitespace', () => {
        let result = pagemarks.parseQuery('"foo bar"');
        expect(result).to.not.be.null;
        expect(result.words).to.deep.equal(['foo bar']);
        expect(result.tags).to.deep.equal([]);
    });


    it('handles a mixture of tags and words', () => {
        let result = pagemarks.parseQuery('"foo" "bar boo" [tag1]word [tag2] bar');
        expect(result).to.not.be.null;
        expect(result.words).to.deep.equal(['foo', 'bar boo', 'word', 'bar']);
        expect(result.tags).to.deep.equal(['tag1', 'tag2']);
    });


    it('treats closing tag bracket as word boundary', () => {
        let result = pagemarks.parseQuery('foo [tag]bar');
        expect(result).to.not.be.null;
        expect(result.words).to.deep.equal(['foo', 'bar']);
        expect(result.tags).to.deep.equal(['tag']);
    });


    it('recognizes words which were started quoted but not closed', () => {
        let result = pagemarks.parseQuery('"foobar');
        expect(result).to.not.be.null;
        expect(result.words).to.deep.equal(['foobar']);
        expect(result.tags).to.deep.equal([]);
    });


    it('removes quotes from a single quotes word', () => {
        let result = pagemarks.parseQuery('"foo"');
        expect(result).to.not.be.null;
        expect(result.words).to.deep.equal(['foo']);
        expect(result.tags).to.deep.equal([]);
    });


    it('removes brackets from a single tag', () => {
        let result = pagemarks.parseQuery('[tag]');
        expect(result).to.not.be.null;
        expect(result.words).to.deep.equal([]);
        expect(result.tags).to.deep.equal(['tag']);
    });


    it('treats unclosed tags as words (without its opening tag bracket)', () => {
        let result = pagemarks.parseQuery('[tag');
        expect(result).to.not.be.null;
        expect(result.words).to.deep.equal(['tag']);
        expect(result.tags).to.deep.equal([]);
    });


    it('treats quotes and opening brackets enclosed in words as part of the word', () => {
        let result = pagemarks.parseQuery('foo"b[ar');
        expect(result).to.not.be.null;
        expect(result.words).to.deep.equal(['foo"b[ar']);
        expect(result.tags).to.deep.equal([]);
    });


    it('assigns no special meaning to closing brackets when no opening bracket was present', () => {
        let result = pagemarks.parseQuery('foo tag]');
        expect(result).to.not.be.null;
        expect(result.words).to.deep.equal(['foo', 'tag]']);
        expect(result.tags).to.deep.equal([]);
    });


    it('assigns no special meaning to closing quotes when no opening quote was present', () => {
        let result = pagemarks.parseQuery('foo bar"');
        expect(result).to.not.be.null;
        expect(result.words).to.deep.equal(['foo', 'bar"']);
        expect(result.tags).to.deep.equal([]);
    });


    it('correctly handles escaped quotes', () => {
        let result = pagemarks.parseQuery('foo "bar\\\\\"boo far" "boo\\\""');
        expect(result).to.not.be.null;
        expect(result.words).to.deep.equal(['foo', 'bar\\\\\"boo far', 'boo\\\"']);
        expect(result.tags).to.deep.equal([]);
    });
});