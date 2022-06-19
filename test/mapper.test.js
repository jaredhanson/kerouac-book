var chai = require('chai');
var sinon = require('sinon');
var Mapper = require('../lib/mapper');
var path = require('path');
var GitBook = require('../lib/gitbook');


describe('Mapper', function() {
  
  it('should request chapters', function(done) {
    var book = new GitBook(path.resolve(__dirname, './data/books/standard'));
    
    chai.kerouac.map(new Mapper(book))
      .close(function() {
        expect(this).to.request([
          '/index.html',
          '/chapter-1.html',
          '/chapter-2.html'
        ]);
        done();
      })
      .generate();
  }); // should request chapters
  
  it('should request preface when preface is not included in contents', function(done) {
    var book = new GitBook(path.resolve(__dirname, './data/books/simple'));
    
    chai.kerouac.map(new Mapper(book))
      .close(function() {
        expect(this).to.request([
          '/index.html',
          '/chapter-1.html',
          '/chapter-2.html'
        ]);
        done();
      })
      .generate();
  }); // should request preface when preface is not included in contents
  
  it('should request chapters and subchapters', function(done) {
    var book = new GitBook(path.resolve(__dirname, './data/books/subchapters'));
    
    chai.kerouac.map(new Mapper(book))
      .close(function() {
        expect(this).to.request([
          '/index.html',
          '/chapter-1/README.html',
          '/chapter-1/subchapter-1.html',
          '/chapter-1/subchapter-2.html',
          '/chapter-2/README.html',
          '/chapter-2/subchapter-1.html',
          '/chapter-2/subchapter-2.html'
        ]);
        done();
      })
      .generate();
  }); // should request chapters and subchapters
  
  it('should request preface when only readme', function(done) {
    var book = new GitBook(path.resolve(__dirname, './data/books/readme'));
    
    chai.kerouac.map(new Mapper(book))
      .close(function() {
        expect(this).to.request([
          '/index.html'
        ]);
        done();
      })
      .generate();
  }); // should request preface when only readme
  
  it('should not duplicate requests for chapters pointed to by anchors', function(done) {
    var book = new GitBook(path.resolve(__dirname, './data/books/anchors'));
    
    chai.kerouac.map(new Mapper(book))
      .close(function() {
        expect(this).to.request([
          '/index.html',
          '/chapter-1/README.html',
          '/chapter-2/README.html'
        ]);
        done();
      })
      .generate();
  }); // should not duplicate requests for chapters pointed to by anchors
  
  it('should request HTML-formatted download when option is set', function(done) {
    var book = new GitBook(path.resolve(__dirname, './data/books/simple'));
    
    chai.kerouac.map(new Mapper(book, true))
      .close(function() {
        expect(this).to.request([
          '/index.html',
          '/chapter-1.html',
          '/chapter-2.html',
          '/downloads/html.html'
        ]);
        done();
      })
      .generate();
  }); // should request HTML-formatted download when option is set
  
  it('should yield error when encountering error reading contents', function(done) {
    var book = new GitBook(path.resolve(__dirname, './data/books/simple'));
    sinon.stub(book, 'contents').yieldsAsync(new Error('something went wrong'));
    
    chai.kerouac.map(new Mapper(book))
      .close(function() {
        expect(this).to.request([
          '/index.html'
        ]).and.error('something went wrong');
        done();
      })
      .generate();
  }); // should yield error when encountering error reading contents
  
});
