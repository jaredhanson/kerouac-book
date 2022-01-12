var kerouac = require('kerouac')
  , merge = require('utils-merge');


exports = module.exports = function(book, layout) {
  
  function compileChapter(page, next) {
    var slug = page.params[0];
    if (slug == 'index') { slug = 'README'; }
    
    book.chapter(slug, function(err, chapter) {
      if (err) { return next(err); }
      if (!chapter) { return next('route'); } // TODO: handle this better
      
      if (chapter.head) { merge(page.locals, chapter.head); }
      
      var title = chapter.head.title || chapter.title;
      
      
      page.locals.title = book.title ? book.title + ': ' + title : title;
      
      page.createdAt = chapter.createdAt;
      page.modifiedAt = chapter.modifiedAt;
      
      page.compile(chapter.content, chapter.type, chapter.head.layout || layout);
    });
  }
  
  
  return [
    kerouac.manifest(), // TODO: Move to app level?
    kerouac.canonicalURL(), // TODO: Move to app level?
    compileChapter
  ];
};
