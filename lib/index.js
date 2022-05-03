var kerouac = require('kerouac')
  , BookBrowser = require('./browsers/book')
  , GitBook = require('./gitbook');


/**
 * Generate book site.
 *
 * This function creates a site which generates a set of pages for a book.
 */
exports = module.exports = function(title, dir, options) {
  if (typeof dir == 'object') {
    options = dir;
    dir = options.dir;
  }
  dir = dir || 'book';
  options = options || {};
  
  var readmeFile = options.summary || 'README.md'
    , tocFile = options.summary || 'SUMMARY.md';
  
  var book = new GitBook(dir || 'book', title);
  
  var router = new kerouac.Router();
  //router.page('/index.html', require('./handlers/chapter')(title, dir, book, readmeFile, 'book/chapter'));
  router.page('/downloads/html.html', require('./handlers/downloads/html')(book, options.layout));
  router.page('/*.html', require('./handlers/chapter')(book, 'book/chapter'));
  
  return router;
};

exports.browser = function(dir, download) {
  var book = new GitBook(dir || 'book');
  return new BookBrowser(book, download);
};
