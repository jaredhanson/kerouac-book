var merge = require('utils-merge')
  , utils = require('../utils');

module.exports = function(book, layout) {
  
  return function chapter(page, next) {
    function render(err, chapter) {
      if (err) { return next(err); }
      // If the chapter is not found, go to the next route.  The requested file
      // may be a static asset, which the next route will copy to the output
      // directory.  Otherwise, it will bubble up to the app's final handler
      // which will handle non-generated file appropriately.
      if (!chapter) { return next('route'); }
  
      function flattenArticles(entry, arr) {
        if (entry.path) { arr.push(entry); }
        if (entry.articles) {
          var i, len;
          for (i = 0, len = entry.articles.length; i < len; ++i) {
            flattenArticles(entry.articles[i], arr);
          }
        }
      } 
  
      var articles = []
        , i, len;
      for (i = 0, len = page.locals.summary.parts.length; i < len; ++i) {
        flattenArticles(page.locals.summary.parts[i], articles);
      }
  
      // Define the [page variables][1] set by GitBook.
      //
      // Any variables set in the page's front matter are also added to the page
      // variable, as [specified][2].
      //
      // [1]: https://github.com/GitbookIO/gitbook/blob/master/docs/templating/variables.md#page-variables
      // [2]: https://github.com/GitbookIO/gitbook/blob/master/docs/pages.md#front-matter
      page.locals.page = {
        title: chapter.title,
        previous: null,
        next: null
      };
      merge(page.locals.page, chapter.front);
  
      var idx = articles.findIndex(function(article) {
        return article.path == chapter.href;
      });
      if (idx !== -1) {
        if (idx > 0) {
          page.locals.page.previous = articles[idx - 1];
        }
        if (idx < articles.length - 1) {
          page.locals.page.next = articles[idx + 1];
        }
      }
  
      // Define the [file variables][1] set by GitBook.
      //
      // [1]: https://github.com/GitbookIO/gitbook/blob/master/docs/templating/variables.md#file-variables
      page.locals.file = {
        path: chapter.path,
        type: utils.fileType(chapter.format),
        mtime: chapter.modifiedAt
      };
  
      page.createdAt = chapter.createdAt;
      page.modifiedAt = chapter.modifiedAt;
  
      page.compile(chapter.content, chapter.format, chapter.front.layout || layout);
    }
    
    var slug = page.params[0];
    if (slug) {
      book.chapter(slug, render);
    } else {
      book.preface(render);
    }
  };
};
