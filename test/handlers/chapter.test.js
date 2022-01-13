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
          
        expect(this.locals.toc).to.deep.equal([
          { title: 'Chapter 1', href: 'chapter-1.md' },
          { title: 'Chapter 2', href: 'chapter-2.md' }
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
          .with.locals({ title: 'Chapters Example: Chapter 1' })
          .and.beginWith.content('# Chapter 1').of.format('md');
          
        expect(this.locals.toc).to.deep.equal([
          { title: 'Chapter 1', href: 'chapter-1.md' },
          { title: 'Chapter 2', href: 'chapter-2.md' }
        ]);
          
        expect(this.createdAt).to.be.an.instanceof(Date);
        expect(this.modifiedAt).to.be.an.instanceof(Date);
        done();
      })
      .generate();
  }); // should render chapter
  
  it.skip('should render with table of contents containing parts', function(done) {
    var book = new GitBook(path.resolve(__dirname, '../data/parts'));
    
    chai.kerouac.page(factory(book, 'book/chapter'))
      .request(function(page) {
        //page.params = { 0: 'index' };
        page.params = { 0: 'writing' };
      })
      .finish(function() {
        expect(this).to.render('book/chapter')
          .with.locals({
            title: 'Parts: Writing is nice'
          })
          .and.beginWith.content('# Writing').of.format('md');
          
        expect(this.locals.toc).to.deep.equal([
          { text: 'Part I' },
          [
            { title: 'Writing is nice', href: 'part1/writing.md' },
            { title: 'GitBook is nice', href: 'part1/gitbook.md', children: null }
          ],
          { text: 'Part II' },
          [
            { title: 'We love feedback', href: 'part2/feedback_please.md' },
            { title: 'Better tools for authors', href: 'part2/better_tools.md', children: null }
          ],
          { divider: true },
          [
            { title: 'Last part without title', href: 'part3/title.md' }
          ]
        ]);
          
        expect(this.createdAt).to.be.an.instanceof(Date);
        expect(this.modifiedAt).to.be.an.instanceof(Date);
        done();
      })
      .next(function(err) {
        console.log(err);
      })
      .generate();
  }); // should render with table of contents containing parts
  
});
