var context = require('../middleware/context')
  , contents = require('../middleware/contents')
  , chapter = require('../middleware/chapter')
  , filters = require('../middleware/filters');

/**
 * Generate chapter page.
 *
 * This function creates a handler which generates a page for the preface of a
 * book.
 */
exports = module.exports = function(book, layout) {
  
  return [
    filters(),
    context(book),
    contents(book),
    chapter(book, layout)
  ];
};
