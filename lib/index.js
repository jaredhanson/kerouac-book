var kerouac = require('kerouac')
  , Mapper = require('./mapper')
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
  
  
  var layout = options.layout || 'book'
    , fullLayout = options.fullLayout || 'book/html';
  
  
  var book = new GitBook(dir || 'book');
  
  var router = new kerouac.Router();
  router.page('/downloads/html.html', require('./handlers/downloads/html')(book, fullLayout));
  router.page('/index.html', require('./handlers/preface')(book, layout));
  router.page('/*.html', require('./handlers/chapter')(book, layout));
  router.page('/*', kerouac.copy(dir));
  
  return router;
};

exports.createMapper = function(dir, download) {
  var book = new GitBook(dir || 'book');
  return new Mapper(book, download);
};
