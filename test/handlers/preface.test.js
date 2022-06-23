/* global describe, it, expect */

var expect = require('chai').expect;
var chai = require('chai');
var factory = require('../../lib/handlers/preface');
var path = require('path');
var GitBook = require('../../lib/gitbook');


describe('handlers/preface', function() {
  
  it('should render preface', function(done) {
    var book = new GitBook(path.resolve(__dirname, '../data/books/simple'));
    
    chai.kerouac.page(factory(book, 'book/chapter'))
      .finish(function() {
        expect(this).to.render('book/chapter')
          .and.beginWith.content('# Example Book').of.format('md');
        
        expect(this.locals.book).to.deep.equal({
          title: 'Example Book'
        });
        expect(this.locals.gitbook.time).to.be.an.instanceof(Date);
        expect(this.locals.gitbook).to.deep.equal({
          time: this.locals.gitbook.time
        });
        expect(this.locals.page).to.deep.equal({
          title: 'Example Book',
          previous: null,
          next: null
        });
        expect(this.locals.file.mtime).to.be.an.instanceof(Date);
        expect(this.locals.file).to.deep.equal({
          path: 'README.md',
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
  }); // should render preface
  
  it('should render preface included in contents', function(done) {
    var book = new GitBook(path.resolve(__dirname, '../data/books/standard'));
    
    chai.kerouac.page(factory(book, 'book/chapter'))
      .finish(function() {
        expect(this).to.render('book/chapter')
          .and.beginWith.content('# Preface').of.format('md');
        
        expect(this.locals.book).to.deep.equal({
          title: 'Example Book',
          description: 'This book is for use in illustrative examples.'
        });
        expect(this.locals.gitbook.time).to.be.an.instanceof(Date);
        expect(this.locals.gitbook).to.deep.equal({
          time: this.locals.gitbook.time
        });
        expect(this.locals.page).to.deep.equal({
          title: 'Preface',
          previous: null,
          next: {
            title: 'Chapter 1',
            path: 'chapter-1.md'
          }
        });
        expect(this.locals.file.mtime).to.be.an.instanceof(Date);
        expect(this.locals.file).to.deep.equal({
          path: 'README.md',
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
                { title: 'Preface', path: 'README.md' },
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
          title: 'Example Book',
          description: 'This book is for use in illustrative examples.'
        });
        expect(this.createdAt).to.be.an.instanceof(Date);
        expect(this.modifiedAt).to.be.an.instanceof(Date);
        done();
      })
      .generate();
  }); // should render preface included in contents
  
  it('should render preface when only readme', function(done) {
    var book = new GitBook(path.resolve(__dirname, '../data/books/readme'));
    
    chai.kerouac.page(factory(book, 'book/chapter'))
      .finish(function() {
        expect(this).to.render('book/chapter')
          .and.beginWith.content('# Example Book').of.format('md');
        
        expect(this.locals.book).to.deep.equal({
          title: 'Example Book'
        });
        expect(this.locals.gitbook.time).to.be.an.instanceof(Date);
        expect(this.locals.gitbook).to.deep.equal({
          time: this.locals.gitbook.time
        });
        expect(this.locals.page).to.deep.equal({
          title: 'Example Book',
          previous: null,
          next: null
        });
        expect(this.locals.file.mtime).to.be.an.instanceof(Date);
        expect(this.locals.file).to.deep.equal({
          path: 'README.md',
          mtime: this.locals.file.mtime,
          type: 'markdown'
        });
        expect(this.locals.readme).to.deep.equal({
          path: 'README.md'
        });
        expect(this.locals.summary).to.deep.equal({
          parts: []
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
  }); // should render preface when only readme
  
});
