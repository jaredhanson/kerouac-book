/* global describe, it, expect */

var $require = require('proxyquire');
var expect = require('chai').expect;
var chai = require('chai');
var GitBook = require('../lib/gitbook');
var fs = require('fs');


describe('GitBook', function() {
  
  describe('constructor', function() {
    
    it('should parse config', function() {
      var GitBook = $require('../lib/gitbook', {
        'fs': {
          existsSync: function(path) {
            switch (path) {
            case '/tmp/books/standard/book.json':
              return true;
            case '/tmp/books/standard/README.md':
              return true;
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFileSync: function(path, encoding) {
            switch (path) {
            case '/tmp/books/standard/book.json':
              return fs.readFileSync('test/data/books/standard/book.json', 'utf8');
            case '/tmp/books/standard/README.md':
              return fs.readFileSync('test/data/books/standard/README.md', 'utf8');
            }
            throw new Error('Unexpected path: ' + path);
          }
        }
      });
      
      var book = new GitBook('/tmp/books/standard');
      expect(book.title).to.equal('Example Book');
      expect(book.description).to.equal('This book is for use in illustrative examples.');
    }); // should parse config
    
    it('should parse readme', function() {
      var GitBook = $require('../lib/gitbook', {
        'fs': {
          existsSync: function(path) {
            switch (path) {
            case '/tmp/books/readme/book.json':
              return false;
            case '/tmp/books/readme/README.md':
              return true;
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFileSync: function(path, encoding) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/readme/README.md':
              return fs.readFileSync('test/data/books/readme/README.md', 'utf8');
            }
            throw new Error('Unexpected path: ' + path);;
          }
        }
      });
      
      var book = new GitBook('/tmp/books/readme');
      expect(book.title).to.equal('Example Book');
      expect(book.description).to.be.undefined;
    }); // should parse readme
    
    it('should throw when readme is missing', function() {
      var GitBook = $require('../lib/gitbook', {
        'fs': {
          existsSync: function(path) {
            switch (path) {
            case '/tmp/books/invalid-readme/book.json':
              return true;
            case '/tmp/books/invalid-readme/README.md':
              return false;
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFileSync: function(path, encoding) {
            switch (path) {
            case '/tmp/books/invalid-readme/book.json':
              return fs.readFileSync('test/data/books/invalid-readme/book.json', 'utf8');
            }
            throw new Error('Unexpected path: ' + path);
          }
        }
      });
      
      expect(function() {
        new GitBook('/tmp/books/invalid-readme');
      }).to.throw("Missing required GitBook readme at '/tmp/books/invalid-readme/README.md'");
    }); // should throw when readme is missing
    
    it('should throw when config is malformed', function() {
      var GitBook = $require('../lib/gitbook', {
        'fs': {
          existsSync: function(path) {
            switch (path) {
            case '/tmp/books/invalid-config/book.json':
              return true;
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFileSync: function(path, encoding) {
            switch (path) {
            case '/tmp/books/invalid-config/book.json':
              return fs.readFileSync('test/data/books/invalid-config/book.json', 'utf8');
            }
            throw new Error('Unexpected path: ' + path);
          }
        }
      });
      
      expect(function() {
        new GitBook('/tmp/books/invalid-config');
      }).to.throw("Failed to parse GitBook configuration at '/tmp/books/invalid-config/book.json'");
    }); // should throw when config is malformed
    
  }); // constructor
  
  describe('#chapters', function() {
    
    it('should yield chapters', function(done) {
      var GitBook = $require('../lib/gitbook', {
        'fs': {
          existsSync: function(path) {
            switch (path) {
            case '/tmp/books/simple/book.json':
              return false;
            case '/tmp/books/simple/README.md':
              return true;
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFileSync: function(path, encoding) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/simple/README.md':
              return fs.readFileSync('test/data/books/simple/README.md', 'utf8');
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFile: function(path, encoding, callback) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/simple/SUMMARY.md':
              return fs.readFile('test/data/books/simple/SUMMARY.md', 'utf8', callback);
            }
            throw new Error('Unexpected path: ' + path);
          }
        }
      });
      
      var book = new GitBook('/tmp/books/simple');
      book.chapters(function(err, chapters) {
        if (err) { return done(err); }
        
        expect(chapters).to.deep.equal([
          { title: 'Chapter 1', path: 'chapter-1.md' },
          { title: 'Chapter 2', path: 'chapter-2.md' }
        ]);
        done();
      });
    }); // should yield chapters
    
    it('should yield chapters with subchapters', function(done) {
      var GitBook = $require('../lib/gitbook', {
        'fs': {
          existsSync: function(path) {
            switch (path) {
            case '/tmp/books/subchapters/book.json':
              return false;
            case '/tmp/books/subchapters/README.md':
              return true;
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFileSync: function(path, encoding) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/subchapters/README.md':
              return fs.readFileSync('test/data/books/subchapters/README.md', 'utf8');
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFile: function(path, encoding, callback) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/subchapters/SUMMARY.md':
              return fs.readFile('test/data/books/subchapters/SUMMARY.md', 'utf8', callback);
            }
            throw new Error('Unexpected path: ' + path);
          }
        }
      });
      
      var book = new GitBook('/tmp/books/subchapters');
      book.chapters(function(err, chapters) {
        if (err) { return done(err); }
        
        expect(chapters).to.deep.equal([
          {
            title: 'Chapter 1',
            path: 'chapter-1/README.md',
            chapters: [
              { title: 'Chapter 1-1', path: 'chapter-1/subchapter-1.md' },
              { title: 'Chapter 1-2', path: 'chapter-1/subchapter-2.md' }
            ]
          },
          {
            title: 'Chapter 2',
            path: 'chapter-2/README.md',
            chapters: [
              { title: 'Chapter 2-1', path: 'chapter-2/subchapter-1.md' },
              { title: 'Chapter 2-2', path: 'chapter-2/subchapter-2.md' }
            ]
          }
        ]);
        done();
      });
    }); // should yield chapters with subchapters
    
    it('should yield chapters but omit parts', function(done) {
      var GitBook = $require('../lib/gitbook', {
        'fs': {
          existsSync: function(path) {
            switch (path) {
            case '/tmp/books/parts/book.json':
              return false;
            case '/tmp/books/parts/README.md':
              return true;
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFileSync: function(path, encoding) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/parts/README.md':
              return fs.readFileSync('test/data/books/parts/README.md', 'utf8');
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFile: function(path, encoding, callback) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/parts/SUMMARY.md':
              return fs.readFile('test/data/books/parts/SUMMARY.md', 'utf8', callback);
            }
            throw new Error('Unexpected path: ' + path);
          }
        }
      });
      
      var book = new GitBook('/tmp/books/parts');
      book.chapters(function(err, chapters) {
        if (err) { return done(err); }
        
        expect(chapters).to.deep.equal([
          { title: 'Chapter 1', path: 'part-1/chapter-1.md' },
          { title: 'Chapter 2', path: 'part-1/chapter-2.md' },
          { title: 'Chapter 3', path: 'part-2/chapter-3.md' },
          { title: 'Chapter 4', path: 'part-2/chapter-4.md' },
          { title: 'Chapter 5', path: 'part-3/chapter-5.md' }
        ]);
        done();
      });
    }); // should yield chapters but omit parts
    
    it('should yield chapters and include parts when option is set', function(done) {
      var GitBook = $require('../lib/gitbook', {
        'fs': {
          existsSync: function(path) {
            switch (path) {
            case '/tmp/books/parts/book.json':
              return false;
            case '/tmp/books/parts/README.md':
              return true;
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFileSync: function(path, encoding) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/parts/README.md':
              return fs.readFileSync('test/data/books/parts/README.md', 'utf8');
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFile: function(path, encoding, callback) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/parts/SUMMARY.md':
              return fs.readFile('test/data/books/parts/SUMMARY.md', 'utf8', callback);
            }
            throw new Error('Unexpected path: ' + path);
          }
        }
      });
      
      var book = new GitBook('/tmp/books/parts');
      book.chapters({ includeParts: true }, function(err, chapters) {
        if (err) { return done(err); }
        
        expect(chapters).to.deep.equal([
          {
            title: 'Part 1',
            chapters: [
              { title: 'Chapter 1', path: 'part-1/chapter-1.md' },
              { title: 'Chapter 2', path: 'part-1/chapter-2.md' }
            ]
          },
          {
            title: 'Part 2',
            chapters: [
              { title: 'Chapter 3', path: 'part-2/chapter-3.md' },
              { title: 'Chapter 4', path: 'part-2/chapter-4.md' }
            ]
          },
          {
            divider: true,
            chapters: [
              { title: 'Chapter 5', path: 'part-3/chapter-5.md' }
            ]
          }
        ]);
        done();
      });
    }); // should yield chapters and include parts when option is set
    
    it('should yield chapters and subchapters but omit parts', function(done) {
      var GitBook = $require('../lib/gitbook', {
        'fs': {
          existsSync: function(path) {
            switch (path) {
            case '/tmp/books/parts-subchapters/book.json':
              return false;
            case '/tmp/books/parts-subchapters/README.md':
              return true;
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFileSync: function(path, encoding) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/parts-subchapters/README.md':
              return fs.readFileSync('test/data/books/parts-subchapters/README.md', 'utf8');
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFile: function(path, encoding, callback) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/parts-subchapters/SUMMARY.md':
              return fs.readFile('test/data/books/parts-subchapters/SUMMARY.md', 'utf8', callback);
            }
            throw new Error('Unexpected path: ' + path);
          }
        }
      });
      
      var book = new GitBook('/tmp/books/parts-subchapters');
      book.chapters(function(err, chapters) {
        if (err) { return done(err); }
        
        expect(chapters).to.deep.equal([
          {
            title: 'Chapter 1',
            path: 'part-1/chapter-1.md',
            chapters: [
              { title: 'Chapter 1-1', path: 'part-1/chapter-1-1.md' },
              { title: 'Chapter 1-2', path: 'part-1/chapter-1-2.md' }
            ]
          },
          {
            title: 'Chapter 2',
            path: 'part-1/chapter-2.md',
            chapters: [
              { title: 'Chapter 2-1', path: 'part-1/chapter-2-1.md' },
              { title: 'Chapter 2-2', path: 'part-1/chapter-2-2.md' }
            ]
          },
          {
            title: 'Chapter 3',
            path: 'part-2/chapter-3.md'
          },
          {
            title: 'Chapter 4',
            path: 'part-2/chapter-4.md',
            chapters: [
              { title: 'Chapter 4-1', path: 'part-2/chapter-4-1.md' },
              { title: 'Chapter 4-2', path: 'part-2/chapter-4-2.md' }
            ]
          },
          {
            title: 'Chapter 5',
            path: 'part-3/chapter-5.md',
            chapters: [
              { title: 'Chapter 5-1', path: 'part-3/chapter-5-1.md' },
              { title: 'Chapter 5-2', path: 'part-3/chapter-5-2.md' }
            ]
          }
        ]);
        done();
      });
    }); // should yield chapters and subchapters but omit parts
    
    it('should yield chapters with subchapters and include parts when option is set', function(done) {
      var GitBook = $require('../lib/gitbook', {
        'fs': {
          existsSync: function(path) {
            switch (path) {
            case '/tmp/books/parts-subchapters/book.json':
              return false;
            case '/tmp/books/parts-subchapters/README.md':
              return true;
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFileSync: function(path, encoding) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/parts-subchapters/README.md':
              return fs.readFileSync('test/data/books/parts-subchapters/README.md', 'utf8');
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFile: function(path, encoding, callback) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/parts-subchapters/SUMMARY.md':
              return fs.readFile('test/data/books/parts-subchapters/SUMMARY.md', 'utf8', callback);
            }
            throw new Error('Unexpected path: ' + path);
          }
        }
      });
      
      var book = new GitBook('/tmp/books/parts-subchapters');
      book.chapters({ includeParts: true }, function(err, chapters) {
        if (err) { return done(err); }
        
        expect(chapters).to.deep.equal([
          {
            title: 'Part 1', 
            chapters: [
              {
                title: 'Chapter 1',
                path: 'part-1/chapter-1.md',
                chapters: [
                  { title: 'Chapter 1-1', path: 'part-1/chapter-1-1.md' },
                  { title: 'Chapter 1-2', path: 'part-1/chapter-1-2.md' }
                ]
              },
              {
                title: 'Chapter 2',
                path: 'part-1/chapter-2.md',
                chapters: [
                  { title: 'Chapter 2-1', path: 'part-1/chapter-2-1.md' },
                  { title: 'Chapter 2-2', path: 'part-1/chapter-2-2.md' }
                ]
              }
            ]
          },
          {
            title: 'Part 2', 
            chapters: [
              {
                title: 'Chapter 3',
                path: 'part-2/chapter-3.md'
              },
              {
                title: 'Chapter 4',
                path: 'part-2/chapter-4.md',
                chapters: [
                  { title: 'Chapter 4-1', path: 'part-2/chapter-4-1.md' },
                  { title: 'Chapter 4-2', path: 'part-2/chapter-4-2.md' }
                ]
              }
            ]
          },
          {
            divider: true,
            chapters: [
              {
                title: 'Chapter 5',
                path: 'part-3/chapter-5.md',
                chapters: [
                  { title: 'Chapter 5-1', path: 'part-3/chapter-5-1.md' },
                  { title: 'Chapter 5-2', path: 'part-3/chapter-5-2.md' }
                ]
              }
            ]
          }
        ]);
        done();
      });
    }); // should yield chapters with subchapters and include parts when option is set
    
    it('should yield chapters followed by parts', function(done) {
      var GitBook = $require('../lib/gitbook', {
        'fs': {
          existsSync: function(path) {
            switch (path) {
            case '/tmp/books/parts-middle/book.json':
              return false;
            case '/tmp/books/parts-middle/README.md':
              return true;
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFileSync: function(path, encoding) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/parts-middle/README.md':
              return fs.readFileSync('test/data/books/parts-middle/README.md', 'utf8');
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFile: function(path, encoding, callback) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/parts-middle/SUMMARY.md':
              return fs.readFile('test/data/books/parts-middle/SUMMARY.md', 'utf8', callback);
            }
            throw new Error('Unexpected path: ' + path);
          }
        }
      });
      
      var book = new GitBook('/tmp/books/parts-middle');
      book.chapters({ includeParts: true }, function(err, chapters) {
        if (err) { return done(err); }
        
        expect(chapters).to.deep.equal([
          { title: 'Chapter 1', path: 'chapter-1.md' },
          { title: 'Chapter 2', path: 'chapter-2.md' },
          {
            title: 'Part 1',
            chapters: [
              { title: 'Chapter 3', path: 'part-1/chapter-3.md' },
              { title: 'Chapter 4', path: 'part-1/chapter-4.md' }
            ]
          }
        ]);
        done();
      });
    }); // should yield chapters followed by parts
    
    it('should not yield chapters when only readme', function(done) {
      var GitBook = $require('../lib/gitbook', {
        'fs': {
          existsSync: function(path) {
            switch (path) {
            case '/tmp/books/readme/book.json':
              return false;
            case '/tmp/books/readme/README.md':
              return true;
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFileSync: function(path, encoding) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/readme/README.md':
              return fs.readFileSync('test/data/books/readme/README.md', 'utf8');
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFile: function(path, encoding, callback) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/readme/SUMMARY.md':
              return fs.readFile('test/data/books/readme/SUMMARY.md', 'utf8', callback);
            }
            throw new Error('Unexpected path: ' + path);
          }
        }
      });
      
      var book = new GitBook('/tmp/books/readme');
      book.chapters(function(err, chapters) {
        if (err) { return done(err); }
        
        expect(chapters).to.be.undefined;
        done();
      });
    }); // should not yield chapters when only readme
    
    it('should not HTML escape characters in title', function(done) {
      var GitBook = $require('../lib/gitbook', {
        'fs': {
          existsSync: function(path) {
            switch (path) {
            case '/tmp/books/toc-noescape/book.json':
              return false;
            case '/tmp/books/toc-noescape/README.md':
              return true;
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFileSync: function(path, encoding) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/toc-noescape/README.md':
              return fs.readFileSync('test/data/books/toc-noescape/README.md', 'utf8');
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFile: function(path, encoding, callback) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/toc-noescape/SUMMARY.md':
              return fs.readFile('test/data/books/toc-noescape/SUMMARY.md', 'utf8', callback);
            }
            throw new Error('Unexpected path: ' + path);
          }
        }
      });
      
      var book = new GitBook('/tmp/books/toc-noescape');
      book.chapters(function(err, chapters) {
        if (err) { return done(err); }
        
        expect(chapters).to.deep.equal([
          { title: 'Ampersand & Ampersand', path: 'ampersand.md' },
        ]);
        done();
      });
    }); // should not HTML escape characters in title
    
    it('should yield error when encountering file system error', function(done) {
      var GitBook = $require('../lib/gitbook', {
        'fs': {
          existsSync: function(path) {
            switch (path) {
            case '/tmp/books/readme/book.json':
              return false;
            case '/tmp/books/readme/README.md':
              return true;
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFileSync: function(path, encoding) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/readme/README.md':
              return fs.readFileSync('test/data/books/readme/README.md', 'utf8');
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFile: function(path, encoding, callback) {
            process.nextTick(function() {
              return callback(new Error('something went wrong'));
            });
          }
        }
      });
      
      var book = new GitBook('/tmp/books/readme');
      book.chapters(function(err, chapters) {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal('something went wrong');
        done();
      });
    }); // should yield error when encountering file system error
    
  }); // #chapters
  
  describe('#chapter', function() {
    
    it('should yield chapter', function(done) {
      var GitBook = $require('../lib/gitbook', {
        'fs': {
          existsSync: function(path) {
            switch (path) {
            case '/tmp/books/simple/book.json':
              return false;
            case '/tmp/books/simple/README.md':
              return true;
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFileSync: function(path, encoding) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/simple/README.md':
              return fs.readFileSync('test/data/books/simple/README.md', 'utf8');
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFile: function(path, encoding, callback) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/simple/SUMMARY.md':
              return fs.readFile('test/data/books/simple/SUMMARY.md', 'utf8', callback);
            case '/tmp/books/simple/chapter-1.md':
              return fs.readFile('test/data/books/simple/chapter-1.md', 'utf8', callback);
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          stat: function(path, callback) {
            expect(path).to.equal('/tmp/books/simple/chapter-1.md');
            
            process.nextTick(function() {
              return callback(null, {
                mtime: new Date('2022-01-05T21:48:14.573Z'),
                birthtime: new Date('2021-04-09T22:23:05.773Z')
              });
            });
          }
        }
      });
      
      var book = new GitBook('/tmp/books/simple');
      book.chapter('chapter-1', function(err, chapter) {
        if (err) { return done(err); }
        
        expect(chapter).to.deep.equal({
          title: 'Chapter 1',
          front: {},
          content: "# Chapter 1\n\n",
          format: 'md',
          createdAt: new Date('2021-04-09T22:23:05.773Z'),
          modifiedAt: new Date('2022-01-05T21:48:14.573Z')
        });
        done();
      });
    }); // should yield chapter
    
    it('should yield preface', function(done) {
      var GitBook = $require('../lib/gitbook', {
        'fs': {
          existsSync: function(path) {
            switch (path) {
            case '/tmp/books/simple/book.json':
              return false;
            case '/tmp/books/simple/README.md':
              return true;
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFileSync: function(path, encoding) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/simple/README.md':
              return fs.readFileSync('test/data/books/simple/README.md', 'utf8');
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFile: function(path, encoding, callback) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/simple/SUMMARY.md':
              return fs.readFile('test/data/books/simple/SUMMARY.md', 'utf8', callback);
            case '/tmp/books/simple/README.md':
              return fs.readFile('test/data/books/simple/README.md', 'utf8', callback);
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          stat: function(path, callback) {
            expect(path).to.equal('/tmp/books/simple/README.md');
            
            process.nextTick(function() {
              return callback(null, {
                mtime: new Date('2022-01-05T21:48:14.573Z'),
                birthtime: new Date('2021-04-09T22:23:05.773Z')
              });
            });
          }
        }
      });
      
      var book = new GitBook('/tmp/books/simple');
      book.chapter('README', function(err, chapter) {
        if (err) { return done(err); }
        
        expect(chapter).to.deep.equal({
          title: undefined,
          front: {},
          content: "# Example Book\n",
          format: 'md',
          createdAt: new Date('2021-04-09T22:23:05.773Z'),
          modifiedAt: new Date('2022-01-05T21:48:14.573Z')
        });
        done();
      });
    }); // should yield preface
    
    it('should yield preface included in summary', function(done) {
      var GitBook = $require('../lib/gitbook', {
        'fs': {
          existsSync: function(path) {
            switch (path) {
            case '/tmp/books/standard/book.json':
              return true;
            case '/tmp/books/standard/README.md':
              return true;
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFileSync: function(path, encoding) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/standard/book.json':
              return fs.readFileSync('test/data/books/standard/book.json', 'utf8');
            case '/tmp/books/standard/README.md':
              return fs.readFileSync('test/data/books/standard/README.md', 'utf8');
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFile: function(path, encoding, callback) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/standard/SUMMARY.md':
              return fs.readFile('test/data/books/standard/SUMMARY.md', 'utf8', callback);
            case '/tmp/books/standard/README.md':
              return fs.readFile('test/data/books/standard/README.md', 'utf8', callback);
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          stat: function(path, callback) {
            expect(path).to.equal('/tmp/books/standard/README.md');
            
            process.nextTick(function() {
              return callback(null, {
                mtime: new Date('2022-01-05T21:48:14.573Z'),
                birthtime: new Date('2021-04-09T22:23:05.773Z')
              });
            });
          }
        }
      });
      
      var book = new GitBook('/tmp/books/standard');
      book.chapter('README', function(err, chapter) {
        if (err) { return done(err); }
        
        expect(chapter).to.deep.equal({
          title: 'Preface',
          front: {},
          content: "# Preface\n",
          format: 'md',
          createdAt: new Date('2021-04-09T22:23:05.773Z'),
          modifiedAt: new Date('2022-01-05T21:48:14.573Z')
        });
        done();
      });
    }); // should yield preface included in summary
    
  }); // #chapter
  
});
