var merge = require('utils-merge');

module.exports = function(book) {
  
  return function context(page, next) {
    // Define the [GitBook variables][1] set by GitBook.
    //
    // Note that 'version' is not defined, as this book is not being generated
    // by `gitbook`, but rather this package (which implements the GitBook
    // specification but is not `gitbook`).
    //
    // [1]: https://github.com/GitbookIO/gitbook/blob/master/docs/templating/variables.md#gitbook-variables
    page.locals.gitbook = {
      time: new Date()
    };
    
    // Define the [output variables] set by GitBook.
    //
    // [1]: https://github.com/GitbookIO/gitbook/blob/master/docs/templating/variables.md#output-variables
    page.locals.output = {
      name: 'website'
    };
    
    // Define the [book variables][1] set by GitBook.
    //
    // [1]: https://github.com/GitbookIO/gitbook/blob/master/docs/templating/variables.md#book-variables
    page.locals.book = merge({}, book.config);
    page.locals.book.title = book.title;
    
    page.locals.config = merge({}, book.config);
    
    // Define the [readme variables] set by GitBook.
    //
    // [1]: https://github.com/GitbookIO/gitbook/blob/master/docs/templating/variables.md#readme-variables
    page.locals.readme = {
      path: book._readme
    };
    
    next();
  };
};
