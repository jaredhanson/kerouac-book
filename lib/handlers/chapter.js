var kerouac = require('kerouac')
  , merge = require('utils-merge');


exports = module.exports = function(book, layout) {
  
  function fetchToC(page, next) {
    book.chapters(function(err, chapters) {
      if (err) { return next(err); }
      page.locals.toc = chapters;
      next();
    });
  }
  
  function compileChapter(page, next) {
    var slug = page.params[0];
    
    book.chapter(slug, function(err, chapter) {
      if (err) { return next(err); }
      if (!chapter) { return next('route'); } // TODO: handle this better
      
      merge(page.locals, chapter.head);
      
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
