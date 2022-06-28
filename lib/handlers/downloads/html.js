var path = require('path')
  , slugify = require('slugify')
  , context = require('../../middleware/context')
  , contents = require('../../middleware/contents')
  , filters = require('../../middleware/filters');

slugify.extend({ '/': '-' });

exports = module.exports = function(book, layout) {
  var clazz = 'chapter';
  
  function ebook(page, next) {
    var app = page.app;
    var paths = [
      book._readme
    ];
    
    book.preface(function(err, chapter) {
      if (err) { return next(err); }
      
      var content = '';
      app.convert(chapter.content, 'md', function(err, out) {
        if (err) { return next(err); }
        
        content += '<section class="' + clazz + '" id="' + slugify('README') + '">';
        content += out;
        content += '</section>';
    
        book.contents(function(err, chapters) {
          if (err) { return next(err); }
          if (!chapters) {
            page.render(layout, { content: content });
            return;
          }
      
          function traverse(chapters, cb) {
            var content = ''
              , i = 0, ch;
        
            function iter(err) {
              if (err) { return cb(err); }
          
              ch = chapters[i++];
              if (!ch) { return cb(null, content); }
          
              var ext = path.extname(ch.path);
              var ih = ext.indexOf('#');
              var slug = ch.path.slice(0, ch.path.length - ext.length);
              var p = ch.path.slice(0, ch.path.length - (ih != -1 ? ext.length - ih : 0));
          
              if (paths.indexOf(p) != -1) { return iter(); }
              paths.push(p);
          
              book.chapter(slug, function(err, chapter) {
                if (err) { return iter(err); }
            
                app.convert(chapter.content, 'md', function(err, out) {
                  if (err) { return iter(err); }
              
                  content += '<section class="' + clazz + '" id="' + slugify(slug) + '">';
                  content += out;
                  content += '</section>';
              
                  if (ch.chapters) {
                    traverse(ch.chapters, function(err, out) {
                      if (err) { return iter(err); }
                      content += out;
                      iter();
                    });
                  } else {
                    iter();
                  }
                });
              });
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
    ebook
  ];
};
