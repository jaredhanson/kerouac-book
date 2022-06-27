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
          , i = 0, chapter, ext, slug, id;
        
        function iter(err) {
          if (err) { return cb(err); }
          
          chapter = chapters[i++];
          if (!chapter) { return cb(null, html);}
          
          ext = path.extname(chapter.path);
          //slug = path.basename(chapter.path, ext);
          slug = chapter.path.slice(0, chapter.path.length - ext.length);
          
          if (chapter.path == book._readme) {
            book.preface(doit);
          } else {
            book.chapter(slug, doit);
          }
          
          function doit(err, chapter) {
            if (err) { return iter(err); }
            
            //console.log('DO IT');
            //console.log(chapter)

            app.convert(chapter.content, 'md', function(err, out) {
              if (err) { return iter(err); }

              id = slug;
              html += '<section class="' + clazz + '" id="' + slugify(id) + '">';
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
