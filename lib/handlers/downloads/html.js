var path = require('path')
  , context = require('../../middleware/context')
  , contents = require('../../middleware/contents')
  , filters = require('../../middleware/filters');

exports = module.exports = function(book, layout) {
  var clazz = 'chapter';
  
  function bookLoadContents(page, next) {
    var app = page.app;
    
    page.locals.content = '';
    
    book.contents(function(err, chapters) {
      if (err) { return next(err); }
      
      // TODO: Are parts and dividers here? I don't think so
      //if (ch.text || ch.divider) { continue; }
      
      function traverse(chapters, cb) {
        var html = ''
          , i = 0, chapter, ext, slug, id;
        
        function iter(err) {
          if (err) { return cb(err); }
          
          chapter = chapters[i++];
          if (!chapter) { return cb(null, html);}
          
          ext = path.extname(chapter.path);
          slug = path.basename(chapter.path, ext);
          
          if (slug === 'README') {
            book.preface(doit);
          } else {
            book.chapter(slug, doit);
          }
          
          function doit(err, chapter) {
            if (err) { return iter(err); }

            app.convert(chapter.content, 'md', function(err, out) {
              if (err) { return iter(err); }

              id = slug;
              html += '<section class="' + clazz + '" id="' + id + '">';
              html += out;
              html += '</section>';

              if (chapter.chapters) {
                traverse(chapter.chapters, function(err, shtml) {
                  if (err) { return iter(err); }
                  html += shtml;
                  iter();
                });
              } else {
                iter();
              }
            });
          }
        }
        iter();
      }
      
      
      if (chapters[0].path != 'README.md') {
        //self.request('/index.html')
        chapters = [ {path: 'README.md' }].concat(chapters)
      }
      
      traverse(chapters, function(err, html) {
        //console.log('TRAVERSED!');
        //console.log(err);
        //console.log(html);
        
        if (err) { return next(err); }
        page.locals.title = book.title;
        page.render(layout, { content: html });
      });
    });
  }
  
  
  return [
    filters(),
    context(book, { name: 'ebook', format: 'html' }),
    contents(book),
    bookLoadContents
  ];
};
