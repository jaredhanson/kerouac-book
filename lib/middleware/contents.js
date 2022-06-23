module.exports = function(book) {
  
  return function contents(page, next) {
    book.contents({ includeParts: true }, function(err, chapters) {
      if (err) { return next(err); }
      
      var parts = [];
      chapters.forEach(function(e) {
        if (e.chapters && !e.path) {
          parts.push(e);
        } else {
          parts[0] = parts[0] || { chapters: [] };
          parts[0].chapters.push(e);
        }
      });
      
      // Define the [table of contents variables][1] set by GitBook.
      //
      // Note that the 'parts' variable contains an array of parts, each of
      // which contains an array of chapters.  These chapters are mapped
      // to an 'articles' variable.  This isn't the most intuitive structure
      // to navigate, but is preserved here for compatibility with GitBook.
      //
      // [1]: https://github.com/GitbookIO/gitbook/blob/master/docs/templating/variables.md#table-of-contents-variables
      page.locals.summary = {
        parts: parts.map(toPart)
      };
      
      function toPart(e) {
        var o = {};
        if (e.title) { o.title = e.title; }
        if (e.divider) { o.divider = e.divider; }
        if (e.chapters) { o.articles = e.chapters.map(toArticle); }
        return o;
      }
      
      function toArticle(e) {
        var o = {
          title: e.title,
          path: e.path
        };
        if (e.chapters) { o.articles = e.chapters.map(toArticle); }
        return o;
      }
      
      next();
    });
  };
};
