var path = require('path')
  , slugify = require('slugify')
  , context = require('../../middleware/context')
  , contents = require('../../middleware/contents')
  , filters = require('../../middleware/filters');

slugify.extend({ '/': '-'} );

exports = module.exports = function(book, layout) {
  var clazz = 'chapter';
  
  function bookLoadContents(page, next) {
    var app = page.app;
    
    page.locals.content = '';
    
    book.contents(function(err, chapters) {
      if (err) { return next(err); }
      
      function traverse(chapters, cb) {
        var html = ''
          , i = 0, ch, ext, slug;
        
        function iter(err) {
          if (err) { return cb(err); }
          
          function append(err, chapter) {
            if (err) { return iter(err); }
            
            app.convert(chapter.content, 'md', function(err, out) {
              if (err) { return iter(err); }
              
              html += '<section class="' + clazz + '" id="' + slugify(slug) + '">';
              html += out;
              html += '</section>';
              
              if (ch.chapters) {
                traverse(ch.chapters, function(err, shtml) {
                  if (err) { return iter(err); }
                  html += shtml;
                  iter();
                });
              } else {
                iter();
              }
            });
          }
          
          ch = chapters[i++];
          if (!ch) { return cb(null, html); }
          
          ext = path.extname(ch.path);
          slug = ch.path.slice(0, ch.path.length - ext.length);
          
          if (ch.path == book._readme) {
            book.preface(append);
          } else {
            book.chapter(slug, append);
          }
        }
        iter();
      }
      
      
      if (chapters[0].path != 'README.md') {
        //self.request('/index.html')
        chapters = [ {path: 'README.md' }].concat(chapters)
      }
      
      traverse(chapters, function(err, html) {
        if (err) { return next(err); }
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
