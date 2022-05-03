/* global describe, it */

var expect = require('chai').expect;
var pkg = require('..');


describe('kerouac-book', function() {
  
  it('should export site factory', function() {
    expect(pkg).to.be.a('function');
  });
  
});
