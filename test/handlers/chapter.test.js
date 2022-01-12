/* global describe, it, expect */

var expect = require('chai').expect;
var chai = require('chai');
var factory = require('../../lib/handlers/chapter');
var path = require('path');
var GitBook = require('../../lib/gitbook');


describe('handlers/chapter', function() {
  
  it('should render', function(done) {
    var book = new GitBook(path.resolve(__dirname, '../data/chapters'), 'Chapters');
    
    chai.kerouac.page(factory(book, 'book/chapter'))
      .request(function(page) {
        //page.params = { 0: 'index' };
        page.params = { 0: 'writing' };
      })
      .finish(function() {
        expect(this).to.render('book/chapter')
          .with.locals({ title: 'Chapters: Writing is nice'})
          .and.beginWith.content('# Writing').of.format('md');
          
        expect(this.createdAt).to.be.an.instanceof(Date);
        expect(this.modifiedAt).to.be.an.instanceof(Date);
        done();
      })
      .generate();
  }); // should render
  
});
