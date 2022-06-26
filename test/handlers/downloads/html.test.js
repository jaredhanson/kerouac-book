/* global describe, it, expect */

var expect = require('chai').expect;
var chai = require('chai');
var sinon = require('sinon');
var factory = require('../../../lib/handlers/downloads/html');
var path = require('path');
var GitBook = require('../../../lib/gitbook');


describe('handlers/downloads/html', function() {
  
  it('should render', function(done) {
    var book = new GitBook(path.resolve(__dirname, '../../data/books/simple'));
    
    var convert = sinon.stub().yieldsAsync(null, '1 ');
    
    chai.kerouac.page(factory(book, 'book/ebook'))
      .request(function(page) {
        page.app = { convert: convert };
      })
      .finish(function() {
        expect(this).to.render('book/ebook')
          .with.options({ content: '<section class="chapter" id="README">1 </section><section class="chapter" id="chapter-1">1 </section><section class="chapter" id="chapter-2">1 </section>' });
        
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
