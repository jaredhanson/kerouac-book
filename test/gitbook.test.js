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
            case '/tmp/books/simple-sub/book.json':
              return false;
            case '/tmp/books/simple-sub/README.md':
              return true;
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFileSync: function(path, encoding) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/simple-sub/README.md':
              return fs.readFileSync('test/data/books/simple-sub/README.md', 'utf8');
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFile: function(path, encoding, callback) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/simple-sub/SUMMARY.md':
              return fs.readFile('test/data/books/simple-sub/SUMMARY.md', 'utf8', callback);
            }
            throw new Error('Unexpected path: ' + path);
          }
        }
      });
      
      var book = new GitBook('/tmp/books/simple-sub');
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
    
    it('should yield parts but omit parts', function(done) {
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
          { title: 'Chapter 1', path: 'part1/chapter1.md' },
          { title: 'Chapter 2', path: 'part1/chapter2.md' },
          { title: 'Chapter 3', path: 'part2/chapter3.md' },
          { title: 'Chapter 4', path: 'part2/chapter4.md' },
          { title: 'Chapter 5', path: 'part3/chapter5.md' }
        ]);
        done();
      });
    }); // should yield parts but omit parts
    
    it('should yield parts and include parts when option is set', function(done) {
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
            title: 'Part I',
            chapters: [
              { title: 'Chapter 1', path: 'part1/chapter1.md' },
              { title: 'Chapter 2', path: 'part1/chapter2.md' }
            ]
          },
          {
            title: 'Part II',
            chapters: [
              { title: 'Chapter 3', path: 'part2/chapter3.md' },
              { title: 'Chapter 4', path: 'part2/chapter4.md' }
            ]
          },
          {
            divider: true,
            chapters: [
              { title: 'Chapter 5', path: 'part3/chapter5.md' }
            ]
          }
        ]);
        done();
      });
    }); // should yield parts and include parts when option is set'
    
    it('should yield parts with subchapters but omit parts', function(done) {
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
            path: 'part1/chapter1.md',
            chapters: [
              { title: 'Chapter 1-1', path: 'part1/chapter1-1.md' },
              { title: 'Chapter 1-2', path: 'part1/chapter1-2.md' }
            ]
          },
          {
            title: 'Chapter 2',
            path: 'part1/chapter2.md',
            chapters: [
              { title: 'Chapter 2-1', path: 'part1/chapter2-1.md' },
              { title: 'Chapter 2-2', path: 'part1/chapter2-2.md' }
            ]
          },
          {
            title: 'Chapter 3',
            path: 'part2/chapter3.md'
          },
          {
            title: 'Chapter 4',
            path: 'part2/chapter4.md',
            chapters: [
              { title: 'Chapter 4-1', path: 'part2/chapter4-1.md' },
              { title: 'Chapter 4-2', path: 'part2/chapter4-2.md' }
            ]
          },
          {
            title: 'Chapter 5',
            path: 'part3/chapter5.md',
            chapters: [
              { title: 'Chapter 5-1', path: 'part3/chapter5-1.md' },
              { title: 'Chapter 5-2', path: 'part3/chapter5-2.md' }
            ]
          }
        ]);
        done();
      });
    }); // should yield parts with subchapters but omit parts
    
    it('should yield parts with subchapters and include parts when option is set', function(done) {
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
            title: 'Part I', 
            chapters: [
              {
                title: 'Chapter 1',
                path: 'part1/chapter1.md',
                chapters: [
                  { title: 'Chapter 1-1', path: 'part1/chapter1-1.md' },
                  { title: 'Chapter 1-2', path: 'part1/chapter1-2.md' }
                ]
              },
              {
                title: 'Chapter 2',
                path: 'part1/chapter2.md',
                chapters: [
                  { title: 'Chapter 2-1', path: 'part1/chapter2-1.md' },
                  { title: 'Chapter 2-2', path: 'part1/chapter2-2.md' }
                ]
              }
            ]
          },
          {
            title: 'Part II', 
            chapters: [
              {
                title: 'Chapter 3',
                path: 'part2/chapter3.md'
              },
              {
                title: 'Chapter 4',
                path: 'part2/chapter4.md',
                chapters: [
                  { title: 'Chapter 4-1', path: 'part2/chapter4-1.md' },
                  { title: 'Chapter 4-2', path: 'part2/chapter4-2.md' }
                ]
              }
            ]
          },
          {
            divider: true,
            chapters: [
              {
                title: 'Chapter 5',
                path: 'part3/chapter5.md',
                chapters: [
                  { title: 'Chapter 5-1', path: 'part3/chapter5-1.md' },
                  { title: 'Chapter 5-2', path: 'part3/chapter5-2.md' }
                ]
              }
            ]
          }
        ]);
        done();
      });
    }); // should yield parts with subchapters and include parts when option is set
    
    it('should yield chapters then parts and include parts when option is set', function(done) {
      var GitBook = $require('../lib/gitbook', {
        'fs': {
          existsSync: function(path) {
            switch (path) {
            case '/tmp/books/chapters-parts/book.json':
              return false;
            case '/tmp/books/chapters-parts/README.md':
              return true;
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFileSync: function(path, encoding) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/chapters-parts/README.md':
              return fs.readFileSync('test/data/books/chapters-parts/README.md', 'utf8');
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFile: function(path, encoding, callback) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/chapters-parts/SUMMARY.md':
              return fs.readFile('test/data/books/chapters-parts/SUMMARY.md', 'utf8', callback);
            }
            throw new Error('Unexpected path: ' + path);
          }
        }
      });
      
      var book = new GitBook('/tmp/books/chapters-parts');
      book.chapters({ includeParts: true }, function(err, chapters) {
        if (err) { return done(err); }
        
        expect(chapters).to.deep.equal([
          { title: 'Chapter 1', path: 'chapter-1.md' },
          { title: 'Chapter 2', path: 'chapter-2.md' },
          {
            title: 'Part I',
            chapters: [
              { title: 'Chapter 3', path: 'part1/chapter3.md' },
              { title: 'Chapter 4', path: 'part1/chapter4.md' }
            ]
          }
        ]);
        done();
      });
    }); // should yield chapters then parts and include parts when option is set
    
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
    
    it('should not HTML escape characters', function(done) {
      var GitBook = $require('../lib/gitbook', {
        'fs': {
          existsSync: function(path) {
            switch (path) {
            case '/tmp/books/escape/book.json':
              return false;
            case '/tmp/books/escape/README.md':
              return true;
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFileSync: function(path, encoding) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/escape/README.md':
              return fs.readFileSync('test/data/books/escape/README.md', 'utf8');
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFile: function(path, encoding, callback) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/escape/SUMMARY.md':
              return fs.readFile('test/data/books/escape/SUMMARY.md', 'utf8', callback);
            }
            throw new Error('Unexpected path: ' + path);
          }
        }
      });
      
      var book = new GitBook('/tmp/books/escape');
      book.chapters(function(err, chapters) {
        if (err) { return done(err); }
        
        expect(chapters).to.deep.equal([
          { title: 'Ampersand & Ampersand', path: 'ampersand.md' },
        ]);
        done();
      });
    }); // should not HTML escape characters
    
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
          format: 'md',
          head: {},
          title: 'Chapter 1',
          content: "# Chapter 1\n\n",
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
      book.chapter('index', function(err, chapter) {
        if (err) { return done(err); }
        
        expect(chapter).to.deep.equal({
          format: 'md',
          head: {},
          title: undefined,
          content: "# Example Book\n",
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
      book.chapter('index', function(err, chapter) {
        if (err) { return done(err); }
        
        expect(chapter).to.deep.equal({
          format: 'md',
          head: {},
          title: 'Preface',
          content: "# Preface\n",
          createdAt: new Date('2021-04-09T22:23:05.773Z'),
          modifiedAt: new Date('2022-01-05T21:48:14.573Z')
        });
        done();
      });
    }); // should yield preface included in summary
    
  }); // #chapter
  
});
