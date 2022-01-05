var kerouac = require('kerouac')
  , merge = require('utils-merge');


exports = module.exports = function(book, layout) {
  
  function fetchChapter(page, next) {
    var slug = page.params[0];
    if (slug == 'index') { slug = 'README'; }
    
    book.chapter(slug, function(err, chapter) {
      if (err) { return next(err); }
      if (!chapter) { return next('route'); } // TODO: handle this better
      
      if (chapter.head) merge(page.locals, chapter.head);
      if (chapter.head && chapter.head.layout) { page.layout = chapter.head.layout; }
      
      page.markup = chapter.type;
      page.content = chapter.content;
      page.createdAt = chapter.createdAt;
      page.modifiedAt = chapter.modifiedAt;
      next();
    });
  }
  
  function meta(page, next) {
    page.locals.title = page.locals.title ? book.title + ': ' + page.locals.title : book.title;
    next();
  }
  
  
  return [
    kerouac.manifest(),
    kerouac.canonicalURL(),
    fetchChapter,
    //kerouac.timestamps(), // TODO: put timestamp information in GitBook chapter
    kerouac.layout(layout),
    //kerouac.loadContent(),
    meta,
    kerouac.render()
  ];
};
