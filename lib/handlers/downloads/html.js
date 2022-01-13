var kerouac = require('kerouac')
  , path = require('path');


// https://www.gitbook.com/book/frontendmasters/front-end-handbook/details
// http://idratherbewriting.com/2014/01/12/single-page-docs-versus-click-insanity/
// https://www.youtube.com/watch?v=rXcdTYuxwys&list=PLmV2D6sIiX3UpQFzAIWh-_gsUTGCCtFIj&index=23%3Cbr+%2F%3E%0A
// https://github.com/lord/slate
// https://stripe.com/docs/api#account
// https://developer.paypal.com/docs/api/overview/

// TO READ: http://marked2app.com/help/Multi-File_Documents.html
// http://bcompiler.readthedocs.io/en/latest/installation.html

exports = module.exports = function(book, layout) {
  var clazz = 'chapter';
  
  function bookLoadContents(page, next) {
    var app = page.app;
    
    page.locals.content = '';
    
    book.chapters(function(err, chapters) {
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
          
          ext = path.extname(chapter.href);
          slug = path.basename(chapter.href, ext);
          
          book.chapter(slug, function(err, chapter) {
            if (err) { return iter(err); }
            
            app.convert(chapter.content, 'md', function(err, out) {
              if (err) { return iter(err); }
              
              id = slug;
              html += '<section class="' + clazz + '" id="' + id + '">';
              html += out;
              html += '</section>';
              
              if (chapter.children) {
                traverse(chapter.children, function(err, shtml) {
                  if (err) { return iter(err); }
                  html += shtml;
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
  
  function errorHandler(err, page, next) {
    //console.log('*** ERROR ***');
    //console.log(err);
  }
  
  
  return [
    kerouac.manifest(),
    kerouac.canonicalURL(),
    bookLoadContents,
    //errorHandler
  ];
};
