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
  
  function fetchToC(page, next) {
    page.locals.filters = {};
    page.locals.filters.resolveFile = function(p) {
      // TODO: clean this up, make it handle pretty urls, etc
      var ext = path.extname(p);
      var base = p.slice(0, p.length - ext.length);
      if (base == 'README') { base = '' }
      
      return path.resolve(page.basePath || '/', base) + '/';
    }
    
    
    book.contents({ includeParts: true }, function(err, chapters) {
      if (err) { return next(err); }
      
      var parts = [];
      chapters.forEach(function(e) {
        if (e.chapters) {
          parts.push(e);
        } else {
          parts[0] = parts[0] || { chapters: [] };
          parts[0].chapters.push(e);
        }
      });
      
      function chapterToArticle(e) {
        var o = {};
        o.title = e.title;
        o.path = e.path;
        if (e.chapters) { o.articles = e.chapters.map(chapterToArticle);; }
        return o;
      }
      
      function partToPart(e) {
        var o = {};
        if (e.title) { o.title = e.title; }
        if (e.divider) { o.divider = e.divider; }
        if (e.chapters) { o.articles = e.chapters.map(chapterToArticle); }
        return o;
      }
      
      page.locals.summary = {
        parts: parts.map(partToPart)
      };
      next();
    });
  }
  
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
  
  function errorHandler(err, page, next) {
    //console.log('*** ERROR ***');
    //console.log(err);
  }
  
  
  return [
    kerouac.manifest(),
    kerouac.canonicalURL(),
    fetchToC,
    bookLoadContents,
    //errorHandler
  ];
};
