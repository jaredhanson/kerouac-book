/* global describe, it, expect */

var expect = require('chai').expect;
var chai = require('chai');
var sinon = require('sinon');
var factory = require('../../../lib/handlers/downloads/html');
var path = require('path');
var GitBook = require('../../../lib/gitbook');


describe('handlers/downloads/html', function() {
  
  it('should render when preface is included in contents', function(done) {
    var book = new GitBook(path.resolve(__dirname, '../../data/books/standard'));
    
    chai.kerouac.page(factory(book, 'book/ebook'))
      .request(function(page) {
        var convert = sinon.fake(function(str, type, callback) {
          process.nextTick(function() {
            return callback(null, str);
          });
        });
        
        page.app = { convert: convert };
      })
      .finish(function() {
        expect(this).to.render('book/ebook')
          .with.options({ content: '<section class="chapter" id="README"># Preface\n</section><section class="chapter" id="chapter-1"># Chapter 1\n</section><section class="chapter" id="chapter-2"># Chapter 2\n</section>' });
        
        expect(this.locals.book).to.deep.equal({
          title: 'Example Book',
          description: 'This book is for use in illustrative examples.'
        });
        expect(this.locals.gitbook.time).to.be.an.instanceof(Date);
        expect(this.locals.gitbook).to.deep.equal({
          time: this.locals.gitbook.time
        });
        expect(this.locals.readme).to.deep.equal({
          path: 'README.md'
        });
        expect(this.locals.summary).to.deep.equal({
          parts: [
            {
              articles: [
                { title: 'Preface', path: 'README.md' },
                { title: 'Chapter 1', path: 'chapter-1.md' },
                { title: 'Chapter 2', path: 'chapter-2.md' }
              ]
            }
          ]
        });
        expect(this.locals.output).to.deep.equal({
          name: 'ebook',
          format: 'html'
        });
        expect(this.locals.config).to.deep.equal({
          title: 'Example Book',
          description: 'This book is for use in illustrative examples.'
        });
        done();
      })
      .generate();
  }); // should render when preface is included in contents
  
  it('should render when preface is not included in contents', function(done) {
    var book = new GitBook(path.resolve(__dirname, '../../data/books/simple'));
    
    chai.kerouac.page(factory(book, 'book/ebook'))
      .request(function(page) {
        var convert = sinon.fake(function(str, type, callback) {
          process.nextTick(function() {
            return callback(null, str);
          });
        });
        
        page.app = { convert: convert };
      })
      .finish(function() {
        expect(this).to.render('book/ebook')
          .with.options({ content: '<section class="chapter" id="README"># Example Book\n</section><section class="chapter" id="chapter-1"># Chapter 1\n\n</section><section class="chapter" id="chapter-2"># Chapter 2\n</section>' });
        
        expect(this.locals.book).to.deep.equal({
          title: 'Example Book'
        });
        expect(this.locals.gitbook.time).to.be.an.instanceof(Date);
        expect(this.locals.gitbook).to.deep.equal({
          time: this.locals.gitbook.time
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
          name: 'ebook',
          format: 'html'
        });
        expect(this.locals.config).to.deep.equal({
        });
        done();
      })
      .generate();
  }); // should render when preface is not included in contents
  
  it('should render chapters and subchapters', function(done) {
    var book = new GitBook(path.resolve(__dirname, '../../data/books/subchapters'));
    
    chai.kerouac.page(factory(book, 'book/ebook'))
      .request(function(page) {
        var convert = sinon.fake(function(str, type, callback) {
          process.nextTick(function() {
            return callback(null, str);
          });
        });
        
        page.app = { convert: convert };
      })
      .finish(function() {
        expect(this).to.render('book/ebook')
          .with.options({ content: '<section class="chapter" id="README"># Example Book\n</section><section class="chapter" id="chapter-1-README"># Chapter 1\n</section><section class="chapter" id="chapter-1-subchapter-1"># Chapter 1-1\n</section><section class="chapter" id="chapter-1-subchapter-2"># Chapter 1-2\n</section><section class="chapter" id="chapter-2-README"># Chapter 2\n</section><section class="chapter" id="chapter-2-subchapter-1"># Chapter 2-1\n</section><section class="chapter" id="chapter-2-subchapter-2"># Chapter 2-2\n</section>' });
        
        expect(this.locals.book).to.deep.equal({
          title: 'Example Book'
        });
        expect(this.locals.gitbook.time).to.be.an.instanceof(Date);
        expect(this.locals.gitbook).to.deep.equal({
          time: this.locals.gitbook.time
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
          name: 'ebook',
          format: 'html'
        });
        expect(this.locals.config).to.deep.equal({});
        done();
      })
      .generate();
  }); // should render chapters and subchapters
  
  it('should render only readme', function(done) {
    var book = new GitBook(path.resolve(__dirname, '../../data/books/readme'));
    
    chai.kerouac.page(factory(book, 'book/ebook'))
      .request(function(page) {
        var convert = sinon.fake(function(str, type, callback) {
          process.nextTick(function() {
            return callback(null, str);
          });
        });
        
        page.app = { convert: convert };
      })
      .finish(function() {
        expect(this).to.render('book/ebook')
          .with.options({ content: '<section class="chapter" id="README"># Example Book\n\nThis book is for use in illustrative examples.\n</section>' });
        
        expect(this.locals.book).to.deep.equal({
          title: 'Example Book'
        });
        expect(this.locals.gitbook.time).to.be.an.instanceof(Date);
        expect(this.locals.gitbook).to.deep.equal({
          time: this.locals.gitbook.time
        });
        expect(this.locals.readme).to.deep.equal({
          path: 'README.md'
        });
        expect(this.locals.summary).to.deep.equal({
          parts: []
        });
        expect(this.locals.output).to.deep.equal({
          name: 'ebook',
          format: 'html'
        });
        expect(this.locals.config).to.deep.equal({});
        done();
      })
      .generate();
  }); // should render only readme
  
});
