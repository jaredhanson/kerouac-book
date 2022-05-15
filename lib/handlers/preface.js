var path = require('path')
  , url = require('url')
  , merge = require('utils-merge')
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
  
  function context(page, next) {
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
  }
  
  function tableOfContents(page, next) {
    book.chapters({ includeParts: true }, function(err, chapters) {
      if (err) { return next(err); }
      
      var parts = [];
      chapters.forEach(function(e) {
        if (e.chapters) {
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
  }
  
  function compileChapter(page, next) {
    slug = 'index';
    if (slug == 'index') { slug = 'README'; }
    
    book.preface(function(err, chapter) {
      if (err) { return next(err); }
      if (!chapter) { return next('route'); } // TODO: handle this better
      
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
      // TODO: test case for merging front matter
      merge(page.locals.page, chapter.front);
      
      var idx = articles.findIndex(function(article) {
        return article.path == chapter.path;
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
        mtime: chapter.modifiedAt,
        type: utils.fileType(chapter.format)
      };
      
      page.locals.title
        = book.title
        + (slug !== 'README' ? ': ' + (chapter.front.title || chapter.title) : '');
      page.createdAt = chapter.createdAt;
      page.modifiedAt = chapter.modifiedAt;
      
      page.compile(chapter.content, chapter.format, chapter.front.layout || layout);
    });
  }
  
  
  return [
    filters,
    context,
    tableOfContents,
    compileChapter
  ];
};
