/* global describe, it, expect */

var expect = require('chai').expect;
var chai = require('chai');
var factory = require('../../lib/handlers/chapter');
var path = require('path');
var GitBook = require('../../lib/gitbook');


describe('handlers/chapter', function() {
  
  it('should render preface', function(done) {
    var book = new GitBook(path.resolve(__dirname, '../data/books/chapters'));
    
    chai.kerouac.page(factory(book, 'book/chapter'))
      .request(function(page) {
        page.params = { 0: 'index' };
      })
      .finish(function() {
        expect(this).to.render('book/chapter')
          .with.locals({ title: 'Chapters Example' })
          .and.beginWith.content('# Chapters Example').of.format('md');
        
        expect(this.locals.book).to.deep.equal({
          title: 'Chapters Example'
        });
        expect(this.locals.page).to.deep.equal({
          title: undefined
        });
        expect(this.locals.summary).to.deep.equal([
          {
            chapters: [
              { title: 'Chapter 1', href: 'chapter-1.md' },
              { title: 'Chapter 2', href: 'chapter-2.md' }
            ]
          }
        ]);
        expect(this.createdAt).to.be.an.instanceof(Date);
        expect(this.modifiedAt).to.be.an.instanceof(Date);
        done();
      })
      .next(done)
      .generate();
  }); // should render preface
  
  it('should render chapter', function(done) {
    var book = new GitBook(path.resolve(__dirname, '../data/books/chapters'));
    
    chai.kerouac.page(factory(book, 'book/chapter'))
      .request(function(page) {
        page.params = { 0: 'chapter-1' };
      })
      .finish(function() {
        expect(this).to.render('book/chapter')
          .with.locals({
            title: 'Chapters Example: Chapter 1',
          })
          .and.beginWith.content('# Chapter 1').of.format('md');
          
        expect(this.locals.book).to.deep.equal({
          title: 'Chapters Example'
        });
        expect(this.locals.page).to.deep.equal({
          title: 'Chapter 1'
        });
        expect(this.locals.summary).to.deep.equal([
          {
            chapters: [
              { title: 'Chapter 1', href: 'chapter-1.md' },
              { title: 'Chapter 2', href: 'chapter-2.md' }
            ]
          }
        ]);
        expect(this.createdAt).to.be.an.instanceof(Date);
        expect(this.modifiedAt).to.be.an.instanceof(Date);
        done();
      })
      .generate();
  }); // should render chapter
  
  it('should render with table of contents containing parts', function(done) {
    var book = new GitBook(path.resolve(__dirname, '../data/books/parts'));
    
    chai.kerouac.page(factory(book, 'book/chapter'))
      .request(function(page) {
        page.params = { 0: 'part1/chapter1' };
      })
      .finish(function() {
        expect(this).to.render('book/chapter')
          .and.beginWith.content('# Chapter 1').of.format('md');
        
        expect(this.locals.book).to.deep.equal({
          title: 'Parts Example'
        });
        expect(this.locals.page).to.deep.equal({
          title: 'Chapter 1'
        });
        expect(this.locals.summary).to.deep.equal([
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
        expect(this.createdAt).to.be.an.instanceof(Date);
        expect(this.modifiedAt).to.be.an.instanceof(Date);
        done();
      })
      .generate();
  }); // should render with table of contents containing parts
  
});
