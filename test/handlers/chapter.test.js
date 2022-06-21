/* global describe, it, expect */

var expect = require('chai').expect;
var chai = require('chai');
var factory = require('../../lib/handlers/chapter');
var path = require('path');
var GitBook = require('../../lib/gitbook');


describe('handlers/chapter', function() {
  
  it('should render chapter', function(done) {
    var book = new GitBook(path.resolve(__dirname, '../data/books/simple'));
    
    chai.kerouac.page(factory(book, 'book/chapter'))
      .request(function(page) {
        page.params = { 0: 'chapter-1' };
      })
      .finish(function() {
        expect(this).to.render('book/chapter')
          .and.beginWith.content('# Chapter 1').of.format('md');
          
        expect(this.locals.book).to.deep.equal({
          title: 'Example Book'
        });
        expect(this.locals.gitbook.time).to.be.an.instanceof(Date);
        expect(this.locals.gitbook).to.deep.equal({
          time: this.locals.gitbook.time
        });
        expect(this.locals.page).to.deep.equal({
          title: 'Chapter 1',
          previous: null,
          next: {
            title: 'Chapter 2',
            path: 'chapter-2.md'
          }
        });
        expect(this.locals.file.mtime).to.be.an.instanceof(Date);
        expect(this.locals.file).to.deep.equal({
          path: 'chapter-1.md',
          mtime: this.locals.file.mtime,
          type: 'markdown'
        });
        expect(this.locals.readme).to.deep.equal({
          path: 'README.md'
        });
        expect(this.locals.summary).to.deep.equal({
          parts: [
            {
              articles: [
                { title: 'Chapter 1', path: 'chapter-1.md' },
                { title: 'Chapter 2', path: 'chapter-2.md' }
              ]
            }
          ]
        });
        expect(this.locals.output).to.deep.equal({
          name: 'website'
        });
        expect(this.locals.config).to.deep.equal({
        });
        expect(this.createdAt).to.be.an.instanceof(Date);
        expect(this.modifiedAt).to.be.an.instanceof(Date);
        done();
      })
      .generate();
  }); // should render chapter
  
  it('should render final chapter', function(done) {
    var book = new GitBook(path.resolve(__dirname, '../data/books/simple'));
    
    chai.kerouac.page(factory(book, 'book/chapter'))
      .request(function(page) {
        page.params = { 0: 'chapter-2' };
      })
      .finish(function() {
        expect(this).to.render('book/chapter')
          .and.beginWith.content('# Chapter 2').of.format('md');
          
        expect(this.locals.book).to.deep.equal({
          title: 'Example Book'
        });
        expect(this.locals.gitbook.time).to.be.an.instanceof(Date);
        expect(this.locals.gitbook).to.deep.equal({
          time: this.locals.gitbook.time
        });
        expect(this.locals.page).to.deep.equal({
          title: 'Chapter 2',
          previous: {
            title: 'Chapter 1',
            path: 'chapter-1.md'
          },
          next: null
        });
        expect(this.locals.file.mtime).to.be.an.instanceof(Date);
        expect(this.locals.file).to.deep.equal({
          path: 'chapter-2.md',
          mtime: this.locals.file.mtime,
          type: 'markdown'
        });
        expect(this.locals.readme).to.deep.equal({
          path: 'README.md'
        });
        expect(this.locals.summary).to.deep.equal({
          parts: [
            {
              articles: [
                { title: 'Chapter 1', path: 'chapter-1.md' },
                { title: 'Chapter 2', path: 'chapter-2.md' }
              ]
            }
          ]
        });
        expect(this.locals.output).to.deep.equal({
          name: 'website'
        });
        expect(this.locals.config).to.deep.equal({
        });
        expect(this.createdAt).to.be.an.instanceof(Date);
        expect(this.modifiedAt).to.be.an.instanceof(Date);
        done();
      })
      .generate();
  }); // should render final chapter
  
  it('should render subchapter at end of chapter', function(done) {
    var book = new GitBook(path.resolve(__dirname, '../data/books/subchapters'));
    
    chai.kerouac.page(factory(book, 'book/chapter'))
      .request(function(page) {
        page.params = { 0: 'chapter-1/subchapter-2' };
      })
      .finish(function() {
        expect(this).to.render('book/chapter')
          .and.beginWith.content('# Chapter 1').of.format('md');
          
        expect(this.locals.book).to.deep.equal({
          title: 'Example Book'
        });
        expect(this.locals.gitbook.time).to.be.an.instanceof(Date);
        expect(this.locals.gitbook).to.deep.equal({
          time: this.locals.gitbook.time
        });
        expect(this.locals.page).to.deep.equal({
          title: 'Chapter 1-2',
          previous: {
            title: 'Chapter 1-1',
            path: 'chapter-1/subchapter-1.md'
          },
          next: {
            title: 'Chapter 2',
            path: 'chapter-2/README.md',
            articles: [
              { title: 'Chapter 2-1', path: 'chapter-2/subchapter-1.md' },
              { title: 'Chapter 2-2', path: 'chapter-2/subchapter-2.md' }
            ]
          }
        });
        expect(this.locals.file.mtime).to.be.an.instanceof(Date);
        expect(this.locals.file).to.deep.equal({
          path: 'chapter-1/subchapter-2.md',
          mtime: this.locals.file.mtime,
          type: 'markdown'
        });
        expect(this.locals.readme).to.deep.equal({
          path: 'README.md'
        });
        expect(this.locals.summary).to.deep.equal({
          parts: [
            {
              articles: [
                {
                  title: 'Chapter 1',
                  path: 'chapter-1/README.md',
                  articles: [
                    { title: 'Chapter 1-1', path: 'chapter-1/subchapter-1.md' },
                    { title: 'Chapter 1-2', path: 'chapter-1/subchapter-2.md' }
                  ]
                },
                {
                  title: 'Chapter 2',
                  path: 'chapter-2/README.md',
                  articles: [
                    { title: 'Chapter 2-1', path: 'chapter-2/subchapter-1.md' },
                    { title: 'Chapter 2-2', path: 'chapter-2/subchapter-2.md' }
                  ]
                }
              ]
            }
          ]
        });
        expect(this.locals.output).to.deep.equal({
          name: 'website'
        });
        expect(this.locals.config).to.deep.equal({
        });
        expect(this.createdAt).to.be.an.instanceof(Date);
        expect(this.modifiedAt).to.be.an.instanceof(Date);
        done();
      })
      .generate();
  }); // should render subchapter at end of chapter
  
  it('should render with table of contents containing parts', function(done) {
    var book = new GitBook(path.resolve(__dirname, '../data/books/parts'));
    
    chai.kerouac.page(factory(book, 'book/chapter'))
      .request(function(page) {
        page.params = { 0: 'part-1/chapter-1' };
      })
      .finish(function() {
        expect(this).to.render('book/chapter')
          .and.beginWith.content('# Chapter 1').of.format('md');
        
        expect(this.locals.book).to.deep.equal({
          title: 'Example Book'
        });
        expect(this.locals.gitbook.time).to.be.an.instanceof(Date);
        expect(this.locals.gitbook).to.deep.equal({
          time: this.locals.gitbook.time
        });
        expect(this.locals.page).to.deep.equal({
          title: 'Chapter 1',
          previous: null,
          next: {
            title: 'Chapter 2',
            path: 'part-1/chapter-2.md'
          }
        });
        expect(this.locals.file.mtime).to.be.an.instanceof(Date);
        expect(this.locals.file).to.deep.equal({
          path: 'part-1/chapter-1.md',
          mtime: this.locals.file.mtime,
          type: 'markdown'
        });
        expect(this.locals.readme).to.deep.equal({
          path: 'README.md'
        });
        expect(this.locals.summary).to.deep.equal({
          parts: [
            {
              title: 'Part 1',
              articles: [
                { title: 'Chapter 1', path: 'part-1/chapter-1.md' },
                { title: 'Chapter 2', path: 'part-1/chapter-2.md' }
              ]
            },
            {
              title: 'Part 2',
              articles: [
                { title: 'Chapter 3', path: 'part-2/chapter-3.md' },
                { title: 'Chapter 4', path: 'part-2/chapter-4.md' }
              ]
            },
            {
              divider: true,
              articles: [
                { title: 'Chapter 5', path: 'part-3/chapter-5.md' }
              ]
            }
          ]
        });
        expect(this.locals.output).to.deep.equal({
          name: 'website'
        });
        expect(this.locals.config).to.deep.equal({
        });
        expect(this.createdAt).to.be.an.instanceof(Date);
        expect(this.modifiedAt).to.be.an.instanceof(Date);
        done();
      })
      .generate();
  }); // should render with table of contents containing parts
  
  it('should render with table of contents containing anchors', function(done) {
    var book = new GitBook(path.resolve(__dirname, '../data/books/anchors'));
    
    chai.kerouac.page(factory(book, 'book/chapter'))
      .request(function(page) {
        page.params = { 0: 'chapter-1/README' };
      })
      .finish(function() {
        expect(this).to.render('book/chapter')
          .and.beginWith.content('# Chapter 1').of.format('md');
        
        expect(this.locals.book).to.deep.equal({
          title: 'Example Book'
        });
        expect(this.locals.gitbook.time).to.be.an.instanceof(Date);
        expect(this.locals.gitbook).to.deep.equal({
          time: this.locals.gitbook.time
        });
        expect(this.locals.page).to.deep.equal({
          title: 'Chapter 1',
          previous: null,
          next: {
            title: 'Chapter 1-1',
            path: 'chapter-1/README.md#anchor1'
          }
        });
        expect(this.locals.file.mtime).to.be.an.instanceof(Date);
        expect(this.locals.file).to.deep.equal({
          path: 'chapter-1/README.md',
          mtime: this.locals.file.mtime,
          type: 'markdown'
        });
        expect(this.locals.readme).to.deep.equal({
          path: 'README.md'
        });
        expect(this.locals.summary).to.deep.equal({
          parts: [
            {
              articles: [
                {
                  title: 'Chapter 1',
                  path: 'chapter-1/README.md#anchor0',
                  articles: [
                    { title: 'Chapter 1-1', path: 'chapter-1/README.md#anchor1' },
                    { title: 'Chapter 1-2', path: 'chapter-1/README.md#anchor2' }
                  ]
                },
                {
                  title: 'Chapter 2',
                  path: 'chapter-2/README.md#anchor0',
                  articles: [
                    { title: 'Chapter 2-1', path: 'chapter-2/README.md#anchor1' },
                    { title: 'Chapter 2-2', path: 'chapter-2/README.md#anchor2' }
                  ]
                }
              ]
            }
          ]
        });
        expect(this.locals.output).to.deep.equal({
          name: 'website'
        });
        expect(this.locals.config).to.deep.equal({
        });
        expect(this.createdAt).to.be.an.instanceof(Date);
        expect(this.modifiedAt).to.be.an.instanceof(Date);
        done();
      })
      .generate();
  }); // should render with table of contents containing anchors
  
  describe('filters', function() {
    
    describe('resolveFile', function() {
      
      it('should resolve', function(done) {
        var book = new GitBook(path.resolve(__dirname, '../data/books/simple'));
    
        chai.kerouac.page(factory(book, 'book/chapter'))
          .request(function(page) {
            page.path = '/chapter-1.html';
            page.params = { 0: 'chapter-2' };
          })
          .finish(function() {
            expect(this.locals.filters.resolveFile).to.be.a('function');
            
            var resolveFile = this.locals.filters.resolveFile;
            expect(resolveFile('chapter-2.md')).to.equal('/chapter-2/');
            done();
          })
          .generate();
      }); // should resolve
      
      it('should resolve from base path', function(done) {
        var book = new GitBook(path.resolve(__dirname, '../data/books/simple'));
    
        chai.kerouac.page(factory(book, 'book/chapter'))
          .request(function(page) {
            page.basePath = '/book'
            page.path = '/chapter-1.html';
            page.params = { 0: 'chapter-2' };
          })
          .finish(function() {
            expect(this.locals.filters.resolveFile).to.be.a('function');
            
            var resolveFile = this.locals.filters.resolveFile;
            expect(resolveFile('chapter-2.md')).to.equal('/book/chapter-2/');
            done();
          })
          .generate();
      }); // should resolve from base path
      
    }); // resolveFile
    
  }); // filters
  
});
