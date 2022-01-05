/* global describe, it, expect */

var expect = require('chai').expect;
var chai = require('chai');
var factory = require('../../lib/handlers/chapter');


describe('handlers/chapter', function() {
  
  it.skip('should do something', function(done) {
    
    chai.kerouac.page(factory('Example Book', 'book', 'README.md', 'book/chapter'))
      .finish(function() {
        expect(1).to.equal(2);
        done();
      })
      .generate();
    
  });
  
});
