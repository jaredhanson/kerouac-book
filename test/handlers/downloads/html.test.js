/* global describe, it, expect */

var expect = require('chai').expect;
var chai = require('chai');
var sinon = require('sinon');
var factory = require('../../../lib/handlers/downloads/html');
var path = require('path');
var GitBook = require('../../../lib/gitbook');


describe('handlers/downloads/html', function() {
  
  it('should render', function(done) {
    var book = new GitBook(path.resolve(__dirname, '../../data/chapters'), 'Chapters');
    
    var convert = sinon.stub().yieldsAsync(null, '1 ');
    
    chai.kerouac.page(factory(book, 'book'))
      .request(function(page) {
        page.app = { convert: convert };
        
        
        //page.params = { 0: 'index' };
        //page.params = { 0: 'writing' };
      })
      .finish(function() {
        //expect(1).to.equal(2);
        
        expect(this).to.render('book')
          .with.locals({ title: 'Chapters'})
        
        done();
        
        /*
        expect(this).to.render('book/chapter')
          .with.locals({ title: 'Chapters: Writing is nice'})
          .and.beginWith.content('# Title of the chapter').of.format('md');
          
        expect(this.createdAt).to.be.an.instanceof(Date);
        expect(this.modifiedAt).to.be.an.instanceof(Date);
        done();
        */
      })
      .next(function(err) {
        console.log(err)
      })
      .generate();
  }); // should render
  
});
