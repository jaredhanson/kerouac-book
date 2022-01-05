var fs = require('fs')
  , path = require('path')
  , kerouac = require('kerouac')
  , merge = require('utils-merge');


exports = module.exports = function(title, dir, book, inputFile, layout) {
  var exts = [ '.md' ];
  
  
  function findFile(page, next) {
    var slug = page.params[0];
    if (slug == 'index') { slug = 'README'; }
    
    book.chapter(slug, function(err, chapter) {
      if (err) { return next(err); }
      if (!chapter) { return next('route'); } // TODO: handle this better
      
      if (chapter.head) merge(page.locals, chapter.head);
      if (chapter.head && chapter.head.layout) { page.layout = chapter.head.layout; }
      
      page.markup = chapter.type;
      page.content = chapter.content;
      next();
    });
  }
  
  function meta(page, next) {
    page.locals.title = page.locals.title ? title + ': ' + page.locals.title : title;
    next();
  }
  
  
  return [
    kerouac.manifest(),
    kerouac.canonicalURL(),
    findFile,
    //kerouac.timestamps(), // TODO: put timestamp information in GitBook chapter
    kerouac.layout(layout),
    //kerouac.loadContent(),
    meta,
    kerouac.render()
  ];
};
