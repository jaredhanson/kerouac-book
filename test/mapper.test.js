var chai = require('chai');
var Mapper = require('../lib/mapper');
var path = require('path');
var GitBook = require('../lib/gitbook');


describe('Mapper', function() {
  
  it('should request sitemap', function(done) {
    var book = new GitBook(path.resolve(__dirname, './data/books/simple'));
    
    chai.kerouac.map(new Mapper(book))
      .close(function() {
        expect(this).to.request([
          '/index.html',
          '/chapter-1.html',
          '/chapter-2.html',
          '/downloads/html.html'
        ]);
        done();
      })
      .generate();
  }); // should request sitemap
  
});
