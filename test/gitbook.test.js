/* global describe, it, expect */

var $require = require('proxyquire');
var expect = require('chai').expect;
var chai = require('chai');
var GitBook = require('../lib/gitbook');
var fs = require('fs');


describe('GitBook', function() {
  
  describe('#chapters', function() {
    
    it('should read summary with chapters', function(done) {
      var GitBook = $require('../lib/gitbook', {
        'fs': {
          readFile: function(path, encoding, callback) {
            expect(path).to.equal('/tmp/book/SUMMARY.md');
            expect(encoding).to.equal('utf8');
            return fs.readFile('test/data/chapters/SUMMARY.md', 'utf8', callback);
          }
        }
      });
      
      
      var book = new GitBook('/tmp/book');
      book.chapters(function(err, chapters) {
        if (err) { return done(err); }
        
        expect(chapters).to.deep.equal([
          { title: 'Writing is nice', href: 'writing.md' },
          { title: 'GitBook is nice', href: 'gitbook.md' }
        ]);
        done();
      });
    });
    
    // https://github.com/GitbookIO/gitbook/blob/master/docs/pages.md#summary
    it.only('should read summary with subchapters', function(done) {
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
        
        expect(chapters).to.deep.equal([
          {
            title: 'Part I',
            href: 'part1/README.md',
            children: [
              { title: 'Writing is nice', href: 'part1/writing.md' },
              { title: 'GitBook is nice', href: 'part1/gitbook.md' }
            ]
          },
          {
            title: 'Part II',
            href: 'part2/README.md',
            children: [
              { title: 'We love feedback', href: 'part2/feedback_please.md' },
              { title: 'Better tools for authors', href: 'part2/better_tools.md' }
            ]
          }
        ]);
        done();
      });
    });
    
  });
  
});
