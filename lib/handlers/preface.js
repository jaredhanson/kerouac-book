var path = require('path')
  , url = require('url')
  , merge = require('utils-merge')
  , context = require('../middleware/context')
  , contents = require('../middleware/contents')
  , chapter = require('../middleware/chapter')
  , utils = require('../utils');

/**
 * Generate chapter page.
 *
 * This function creates a handler which generates a page for the preface of a
 * book.
 */
exports = module.exports = function(book, layout) {
  
  function filters(page, next) {
    page.locals.filters = {};
    page.locals.filters.resolveFile = function(p) {
      // TODO: clean this up, make it handle pretty urls, etc
      var ext = path.extname(p);
      var base = p.slice(0, p.length - ext.length);
      if (base == 'README') { base = '' }
      
      return path.resolve(page.basePath || '/', base) + '/';
    };
    
    next();
  }
  
  return [
    filters,
    context(book),
    contents(book),
    chapter(book, layout)
  ];
};
