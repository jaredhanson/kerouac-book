var kerouac = require('kerouac')
  , path = require('path')
  , url = require('url')
  , merge = require('utils-merge');

/**
 * Generate chapter page.
 *
 * This function creates a handler which generates a page for a chapter of a
 * book.
 */
exports = module.exports = function(book, layout) {
  
  function fetchToC(page, next) {
    page.locals.filters = {};
    page.locals.filters.resolveFile = function(p) {
      // TODO: clean this up, make it handle pretty urls, etc
      var ext = path.extname(p);
      var base = p.slice(0, p.length - ext.length);
      if (base == 'README') { base = '' }
      
      return path.resolve(page.basePath || '/', base) + '/';
    }
    
    
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
      
      function chapterToArticle(e) {
        var o = {};
        o.title = e.title;
        o.path = e.path;
        if (e.chapters) { o.articles = e.chapters.map(chapterToArticle);; }
        return o;
      }
      
      function partToPart(e) {
        var o = {};
        if (e.title) { o.title = e.title; }
        if (e.divider) { o.divider = e.divider; }
        if (e.chapters) { o.articles = e.chapters.map(chapterToArticle); }
        return o;
      }
      
      page.locals.summary = {
        parts: parts.map(partToPart)
      };
      next();
    });
  }
  
  function compileChapter(page, next) {
    var slug = page.params[0];
    
    // TODO: Clean this up to not assume .md
    page.locals.file = {
      path: slug + '.md'
    }
    
    book.chapter(slug, function(err, chapter) {
      if (err) { return next(err); }
      if (!chapter) { return next('route'); } // TODO: handle this better
      
      merge(page.locals, chapter.head);
      
      
      // TODO: Set variables according to GitBook:
      // https://github.com/GitbookIO/gitbook/blob/master/docs/templating/variables.md
      
      page.locals.book = {
        title: book.title,
      };
      if (book.description) { page.locals.book.description = book.description; }
      
      // TODO: Don't use head here
      page.locals.page = {
        title: chapter.head.title || chapter.title
      };
      
      page.locals.title
        = book.title
        + (slug !== 'index' ? ': ' + (chapter.head.title || chapter.title) : '');
      page.createdAt = chapter.createdAt;
      page.modifiedAt = chapter.modifiedAt;
      
      page.compile(chapter.content, chapter.format, chapter.head.layout || layout);
    });
  }
  
  
  return [
    kerouac.manifest(), // TODO: Move to app level?
    kerouac.canonicalURL(), // TODO: Move to app level?
    fetchToC,
    compileChapter
  ];
};
