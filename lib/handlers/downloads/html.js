var path = require('path')
  , slugify = require('slugify')
  , context = require('../../middleware/context')
  , contents = require('../../middleware/contents')
  , filters = require('../../middleware/filters');

slugify.extend({ '/': '-' });

exports = module.exports = function(book, layout) {
  var clazz = 'chapter';
  
  function bookLoadContents(page, next) {
    var app = page.app;
    var paths = [
      book._readme
    ];
    
    book.preface(function(err, chapter) {
      if (err) { return next(err); }
      
      var content = '';
      app.convert(chapter.content, 'md', function(err, out) {
        if (err) { return iter(err); }
        
        content += '<section class="' + clazz + '" id="' + slugify('README') + '">';
        content += out;
        content += '</section>';
    
        book.contents(function(err, chapters) {
          if (err) { return next(err); }
      
          function traverse(chapters, cb) {
            var html = ''
              , i = 0, ch;
        
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
          
              var ext = path.extname(ch.path);
              var slug = ch.path.slice(0, ch.path.length - ext.length);
          
              if (paths.indexOf(ch.path) != -1) { return iter(); }
              paths.push(ch.path);
          
              book.chapter(slug, append);
            }
            iter();
          }
      
          traverse(chapters, function(err, out) {
            if (err) { return next(err); }
            content += out;
            page.render(layout, { content: content });
          });
        });
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
