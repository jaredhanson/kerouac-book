var kerouac = require('kerouac')
  , merge = require('utils-merge');


exports = module.exports = function(book, layout) {
  
  function fetchToC(page, next) {
    book.chapters({ includeParts: true }, function(err, chapters) {
      if (err) { return next(err); }
      
      
      var summary = [];
      
      chapters.forEach(function(e) {
        if (e.chapters) {
          summary.push(e);
        } else {
          summary[0] = summary[0] || { chapters: [] };
          summary[0].chapters.push(e);
        }
      });
      
      page.locals.summary = summary;
      next();
    });
  }
  
  function compileChapter(page, next) {
    var slug = page.params[0];
    
    book.chapter(slug, function(err, chapter) {
      if (err) { return next(err); }
      if (!chapter) { return next('route'); } // TODO: handle this better
      
      merge(page.locals, chapter.head);
      
      
      // TODO: Set variables according to GitBook:
      // https://github.com/GitbookIO/gitbook/blob/master/docs/templating/variables.md
      
      page.locals.book = {
        title: book.title
      };
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
