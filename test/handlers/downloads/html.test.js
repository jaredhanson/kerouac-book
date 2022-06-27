/* global describe, it, expect */

var expect = require('chai').expect;
var chai = require('chai');
var sinon = require('sinon');
var factory = require('../../../lib/handlers/downloads/html');
var path = require('path');
var GitBook = require('../../../lib/gitbook');


describe('handlers/downloads/html', function() {
  
  it('should render when preface is not included in contents', function(done) {
    var book = new GitBook(path.resolve(__dirname, '../../data/books/simple'));
    
    chai.kerouac.page(factory(book, 'book/ebook'))
      .request(function(page) {
        var convert = sinon.fake(function(str, type, callback) {
          process.nextTick(function() {
            return callback(null, str);
          });
        });
        
        page.app = { convert: convert };
      })
      .finish(function() {
        expect(this).to.render('book/ebook')
          .with.options({ content: '<section class="chapter" id="README"># Example Book\n</section><section class="chapter" id="chapter-1"># Chapter 1\n\n</section><section class="chapter" id="chapter-2"># Chapter 2\n</section>' });
        
        expect(this.locals.book).to.deep.equal({
          title: 'Example Book'
        });
        expect(this.locals.gitbook.time).to.be.an.instanceof(Date);
        expect(this.locals.gitbook).to.deep.equal({
          time: this.locals.gitbook.time
        });
        expect(this.locals.readme).to.deep.equal({
          path: 'README.md'
        });
        expect(this.locals.summary).to.deep.equal({
          parts: [
            {
              articles: [
                { title: 'Chapter 1', path: 'chapter-1.md' },
                { title: 'Chapter 2', path: 'chapter-2.md' }
              ]
            }
          ]
        });
        expect(this.locals.output).to.deep.equal({
          name: 'ebook',
          format: 'html'
        });
        expect(this.locals.config).to.deep.equal({
        });
        done();
      })
      .generate();
  }); // should render when preface is not included in contents
  
});
