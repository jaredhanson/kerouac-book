/* global describe, it, expect */

var $require = require('proxyquire');
var expect = require('chai').expect;
var chai = require('chai');
var GitBook = require('../lib/gitbook');
var fs = require('fs');


describe('GitBook', function() {
  
  describe('#chapters', function() {
    
    // https://github.com/GitbookIO/gitbook/blob/master/docs/pages.md#summary
    it('should read summary with subchapters', function(done) {
      var GitBook = $require('../lib/gitbook', {
        'fs': {
          readFile: function(path, encoding, callback) {
            expect(path).to.equal('/tmp/book/SUMMARY.md');
            expect(encoding).to.equal('utf8');
            return fs.readFile('test/data/subchapters/SUMMARY.md', 'utf8', callback);
          }
        }
      });
      
      
      var book = new GitBook('/tmp/book');
      book.chapters(function(err, chapters) {
        if (err) { return done(err); }
        
        expect(chapters).to.deep.equal({
          title: 'Foo'
        });
        done();
      });
    });
    
  });
  
});
