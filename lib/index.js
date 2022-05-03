var kerouac = require('kerouac')
  , BookBrowser = require('./browsers/book')
  , GitBook = require('./gitbook');


/**
 * Generate book site.
 *
 * This function creates a site which generates a set of pages for a book.
 */
exports = module.exports = function(dir, options) {
  if (typeof dir == 'object') {
    options = dir;
    dir = options.dir;
  }
  dir = dir || 'book';
  options = options || {};
  
  var book = new GitBook(dir || 'book');
  
  var router = new kerouac.Router();
  router.page('/downloads/html.html', require('./handlers/downloads/html')(book, 'book'));
  router.page('/*.html', require('./handlers/chapter')(book, options.layout));
  
  return router;
};

exports.browser = function(dir, download) {
  var book = new GitBook(dir || 'book');
  return new BookBrowser(book, download);
};
