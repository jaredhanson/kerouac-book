/* global describe, it */

var expect = require('chai').expect;
var pkg = require('..');
var path = require('path');


describe('kerouac-book', function() {
  
  it('should create site', function() {
    var site = pkg(path.resolve(__dirname, './data/books/simple'));
    expect(site).to.be.a('function');
  });
  
  it('should create site with dir option', function() {
    var site = pkg({ dir: path.resolve(__dirname, './data/books/simple') });
    expect(site).to.be.a('function');
  });
  
  describe('.createMapper', function() {
    
    it('should create mapper', function() {
      var mapper = pkg.createMapper(path.resolve(__dirname, './data/books/simple'));
      expect(mapper).to.be.an('object');
    });
    
  });
  
});
