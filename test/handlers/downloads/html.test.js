/* global describe, it, expect */

var expect = require('chai').expect;
var chai = require('chai');
var factory = require('../../../lib/handlers/downloads/html');
var path = require('path');
var GitBook = require('../../../lib/gitbook');


describe('handlers/downloads/html', function() {
  
  it.skip('should render', function(done) {
    var book = new GitBook(path.resolve(__dirname, '../data/chapters'), 'Chapters');
    
    chai.kerouac.page(factory('Chapters', path.resolve(__dirname, '../data/chapters'), 'book/chapter'))
      .request(function(page) {
        //page.params = { 0: 'index' };
        //page.params = { 0: 'writing' };
      })
      .finish(function() {
        expect(1).to.equal(2);
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
      .generate();
  }); // should render
  
});
