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
            case '/tmp/books/config/book.json':
              return true;
            case '/tmp/books/config/README.md':
              return true;
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFileSync: function(path, encoding) {
            switch (path) {
            case '/tmp/books/config/book.json':
              return fs.readFileSync('test/data/books/config/book.json', 'utf8');
            case '/tmp/books/config/README.md':
              return fs.readFileSync('test/data/books/config/README.md', 'utf8');
            }
            throw new Error('Unexpected path: ' + path);
          }
        }
      });
      
      var book = new GitBook('/tmp/books/config');
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
            case '/tmp/books/chapters/book.json':
              return false;
            case '/tmp/books/chapters/README.md':
              return true;
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFileSync: function(path, encoding) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/chapters/README.md':
              return fs.readFileSync('test/data/books/chapters/README.md', 'utf8');
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFile: function(path, encoding, callback) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/chapters/SUMMARY.md':
              return fs.readFile('test/data/books/chapters/SUMMARY.md', 'utf8', callback);
            }
            throw new Error('Unexpected path: ' + path);
          }
        }
      });
      
      var book = new GitBook('/tmp/books/chapters');
      book.chapters(function(err, chapters) {
        if (err) { return done(err); }
        
        expect(chapters).to.deep.equal([
          { title: 'Chapter 1', href: 'chapter-1.md' },
          { title: 'Chapter 2', href: 'chapter-2.md' }
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
            title: 'Part I',
            href: 'part1/README.md',
            chapters: [
              { title: 'Chapter I-1', href: 'part1/chapter-1.md' },
              { title: 'Chapter I-2', href: 'part1/chapter-2.md' }
            ]
          },
          {
            title: 'Part II',
            href: 'part2/README.md',
            chapters: [
              { title: 'Chapter II-1', href: 'part2/chapter-1.md' },
              { title: 'Chapter II-2', href: 'part2/chapter-2.md' }
            ]
          }
        ]);
        done();
      });
    }); // should yield chapters with subchapters
    
    // WIP
    it.skip('should yield chapters with implicit part when option is set', function(done) {
      var GitBook = $require('../lib/gitbook', {
        'fs': {
          existsSync: function(path) {
            switch (path) {
            case '/tmp/books/chapters/book.json':
              return false;
            case '/tmp/books/chapters/README.md':
              return true;
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFileSync: function(path, encoding) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/chapters/README.md':
              return fs.readFileSync('test/data/books/chapters/README.md', 'utf8');
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFile: function(path, encoding, callback) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/chapters/SUMMARY.md':
              return fs.readFile('test/data/books/chapters/SUMMARY.md', 'utf8', callback);
            }
            throw new Error('Unexpected path: ' + path);
          }
        }
      });
      
      var book = new GitBook('/tmp/books/chapters');
      book.chapters({ includeParts: true }, function(err, chapters) {
        if (err) { return done(err); }
        
        expect(chapters).to.deep.equal([
          { title: 'Chapter 1', href: 'chapter-1.md' },
          { title: 'Chapter 2', href: 'chapter-2.md' }
        ]);
        done();
      });
    }); // should yield chapters with implicit part when option is set
    
    it('should yield chapters and omit parts', function(done) {
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
          { title: 'Chapter 1', href: 'part1/chapter1.md' },
          { title: 'Chapter 2', href: 'part1/chapter2.md' },
          { title: 'Chapter 3', href: 'part2/chapter3.md' },
          { title: 'Chapter 4', href: 'part2/chapter4.md' },
          { title: 'Chapter 5', href: 'part3/chapter5.md' }
        ]);
        done();
      });
    }); // should yield chapters and omit parts
    
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
            title: 'Part I',
            chapters: [
              { title: 'Chapter 1', href: 'part1/chapter1.md' },
              { title: 'Chapter 2', href: 'part1/chapter2.md' }
            ]
          },
          {
            title: 'Part II',
            chapters: [
              { title: 'Chapter 3', href: 'part2/chapter3.md' },
              { title: 'Chapter 4', href: 'part2/chapter4.md' }
            ]
          },
          {
            divider: true,
            chapters: [
              { title: 'Chapter 5', href: 'part3/chapter5.md' }
            ]
          }
        ]);
        done();
      });
    }); // should yield chapters and include parts when option is set
    
    it('should yield chapters with subchapters and omit parts', function(done) {
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
            href: 'part1/chapter1.md',
            chapters: [
              { title: 'Chapter 1-1', href: 'part1/chapter1-1.md' },
              { title: 'Chapter 1-2', href: 'part1/chapter1-2.md' }
            ]
          },
          {
            title: 'Chapter 2',
            href: 'part1/chapter2.md',
            chapters: [
              { title: 'Chapter 2-1', href: 'part1/chapter2-1.md' },
              { title: 'Chapter 2-2', href: 'part1/chapter2-2.md' }
            ]
          },
          {
            title: 'Chapter 3',
            href: 'part2/chapter3.md'
          },
          {
            title: 'Chapter 4',
            href: 'part2/chapter4.md',
            chapters: [
              { title: 'Chapter 4-1', href: 'part2/chapter4-1.md' },
              { title: 'Chapter 4-2', href: 'part2/chapter4-2.md' }
            ]
          },
          {
            title: 'Chapter 5',
            href: 'part3/chapter5.md',
            chapters: [
              { title: 'Chapter 5-1', href: 'part3/chapter5-1.md' },
              { title: 'Chapter 5-2', href: 'part3/chapter5-2.md' }
            ]
          }
        ]);
        done();
      });
    }); // should yield chapters with subchapters and omit parts
    
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
            title: 'Part I', 
            chapters: [
              {
                title: 'Chapter 1',
                href: 'part1/chapter1.md',
                chapters: [
                  { title: 'Chapter 1-1', href: 'part1/chapter1-1.md' },
                  { title: 'Chapter 1-2', href: 'part1/chapter1-2.md' }
                ]
              },
              {
                title: 'Chapter 2',
                href: 'part1/chapter2.md',
                chapters: [
                  { title: 'Chapter 2-1', href: 'part1/chapter2-1.md' },
                  { title: 'Chapter 2-2', href: 'part1/chapter2-2.md' }
                ]
              }
            ]
          },
          {
            title: 'Part II', 
            chapters: [
              {
                title: 'Chapter 3',
                href: 'part2/chapter3.md'
              },
              {
                title: 'Chapter 4',
                href: 'part2/chapter4.md',
                chapters: [
                  { title: 'Chapter 4-1', href: 'part2/chapter4-1.md' },
                  { title: 'Chapter 4-2', href: 'part2/chapter4-2.md' }
                ]
              }
            ]
          },
          {
            divider: true,
            chapters: [
              {
                title: 'Chapter 5',
                href: 'part3/chapter5.md',
                chapters: [
                  { title: 'Chapter 5-1', href: 'part3/chapter5-1.md' },
                  { title: 'Chapter 5-2', href: 'part3/chapter5-2.md' }
                ]
              }
            ]
          }
        ]);
        done();
      });
    }); // should yield chapters with subchapters and include parts when option is set
    
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
          { title: 'Ampersand & Ampersand', href: 'ampersand.md' },
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
            case '/tmp/books/chapters/book.json':
              return false;
            case '/tmp/books/chapters/README.md':
              return true;
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFileSync: function(path, encoding) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/chapters/README.md':
              return fs.readFileSync('test/data/books/chapters/README.md', 'utf8');
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFile: function(path, encoding, callback) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/chapters/SUMMARY.md':
              return fs.readFile('test/data/books/chapters/SUMMARY.md', 'utf8', callback);
            case '/tmp/books/chapters/chapter-1.md':
              return fs.readFile('test/data/books/chapters/chapter-1.md', 'utf8', callback);
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          stat: function(path, callback) {
            expect(path).to.equal('/tmp/books/chapters/chapter-1.md');
            
            process.nextTick(function() {
              return callback(null, {
                mtime: new Date('2022-01-05T21:48:14.573Z'),
                birthtime: new Date('2021-04-09T22:23:05.773Z')
              });
            });
          }
        }
      });
      
      var book = new GitBook('/tmp/books/chapters');
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
            case '/tmp/books/chapters/book.json':
              return false;
            case '/tmp/books/chapters/README.md':
              return true;
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFileSync: function(path, encoding) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/chapters/README.md':
              return fs.readFileSync('test/data/books/chapters/README.md', 'utf8');
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFile: function(path, encoding, callback) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/chapters/SUMMARY.md':
              return fs.readFile('test/data/books/chapters/SUMMARY.md', 'utf8', callback);
            case '/tmp/books/chapters/README.md':
              return fs.readFile('test/data/books/chapters/README.md', 'utf8', callback);
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          stat: function(path, callback) {
            expect(path).to.equal('/tmp/books/chapters/README.md');
            
            process.nextTick(function() {
              return callback(null, {
                mtime: new Date('2022-01-05T21:48:14.573Z'),
                birthtime: new Date('2021-04-09T22:23:05.773Z')
              });
            });
          }
        }
      });
      
      var book = new GitBook('/tmp/books/chapters');
      book.chapter('index', function(err, chapter) {
        if (err) { return done(err); }
        
        expect(chapter).to.deep.equal({
          format: 'md',
          head: {},
          title: undefined,
          content: "# Chapters Example\n",
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
            case '/tmp/books/config/book.json':
              return true;
            case '/tmp/books/config/README.md':
              return true;
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFileSync: function(path, encoding) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/config/book.json':
              return fs.readFileSync('test/data/books/config/book.json', 'utf8');
            case '/tmp/books/config/README.md':
              return fs.readFileSync('test/data/books/config/README.md', 'utf8');
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          readFile: function(path, encoding, callback) {
            expect(encoding).to.equal('utf8');
            
            switch (path) {
            case '/tmp/books/config/SUMMARY.md':
              return fs.readFile('test/data/books/config/SUMMARY.md', 'utf8', callback);
            case '/tmp/books/config/README.md':
              return fs.readFile('test/data/books/config/README.md', 'utf8', callback);
            }
            throw new Error('Unexpected path: ' + path);
          },
          
          stat: function(path, callback) {
            expect(path).to.equal('/tmp/books/config/README.md');
            
            process.nextTick(function() {
              return callback(null, {
                mtime: new Date('2022-01-05T21:48:14.573Z'),
                birthtime: new Date('2021-04-09T22:23:05.773Z')
              });
            });
          }
        }
      });
      
      var book = new GitBook('/tmp/books/config');
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
