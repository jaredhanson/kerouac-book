/* global describe, it, expect */

var expect = require('chai').expect;
var chai = require('chai');
var factory = require('../../lib/handlers/chapter');
var path = require('path');
var GitBook = require('../../lib/gitbook');


describe('handlers/chapter', function() {
  
  it.skip('should do something', function(done) {
    var book = new GitBook(path.resolve(__dirname, '../data/chapters'));
    
    chai.kerouac.page(factory(book, 'book/chapter'))
      .request(function(page) {
        //page.params = { 0: 'index' };
        page.params = { 0: 'writing' };
      })
      .finish(function() {
        expect(1).to.equal(2);
        done();
      })
      .generate();
    
  });
  
});
