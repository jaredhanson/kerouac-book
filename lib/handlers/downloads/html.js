var kerouac = require('kerouac')
  , path = require('path');

var fs = require('fs')
  , path = require('path')
  , marked = require('marked')
  , ToCParser = require('../../markdown/toc/parser')
  , ToCRenderer = require('../../markdown/toc/renderer')
  , events = require('events')
  , util = require('util');
  
var fm = require('headmatter')


// https://www.gitbook.com/book/frontendmasters/front-end-handbook/details
// http://idratherbewriting.com/2014/01/12/single-page-docs-versus-click-insanity/
// https://www.youtube.com/watch?v=rXcdTYuxwys&list=PLmV2D6sIiX3UpQFzAIWh-_gsUTGCCtFIj&index=23%3Cbr+%2F%3E%0A
// https://github.com/lord/slate
// https://stripe.com/docs/api#account
// https://developer.paypal.com/docs/api/overview/

// TO READ: http://marked2app.com/help/Multi-File_Documents.html
// http://bcompiler.readthedocs.io/en/latest/installation.html

exports = module.exports = function(title, dir, layout) {
  var clazz = 'chapter';
  
  function loadContents(page, next) {
    var site = page.app
    
    page.contents = [];
    
    (function chapters(toc) {
      var ch, pg, f
        , i, len;
      
      for (i = 0, len = toc.length; i < len; ++i) {
        ch = toc[i];
        if (ch.text || ch.divider) { continue; }
        
        if (Array.isArray(ch)) { chapters(ch); }
        else {
          f = path.resolve(dir, ch.href);
          pg = site.pages.find(function(p) {
            return p.inputPath === f;
          });
          
          if (!pg) { return next(new Error('Failed to find page for HTML download:')); }
          page.contents.push({ id: path.basename(ch.href, path.extname(ch.href)), markup: pg.markup, content: pg.content });
        }
      }
    })(site.toc);
    
    next();
  }
  
  function newLoadContents(page, next) {
    //console.log('NEW LOAD CONTENTS');
    //console.log(page);
    //console.log(dir);
    
    page.locals.chapters = [];
    
    fs.readFile(path.resolve(dir, 'SUMMARY.md'), 'utf8', function(err, text) {
      if (err) { return done(err); }
  
      var tokens = marked.lexer(text);
      var renderer = new ToCRenderer();
      var parser = new ToCParser({ renderer: renderer });
      var toc = parser.parse(tokens);
    
      //console.log(require('util').inspect(toc, false, null));
    
      //self.emit('request', '/index.html');
      page.locals.chapters.push('README.md');
    
      (function chapters(toc, sub) {
        //console.log(toc)
        
        var ch, base, dir, ext, url
          , i, len;
        for (i = 0, len = toc.length; i < len; ++i) {
          ch = toc[i];
          
          if (ch.text || ch.divider) { continue; }
        
          if (Array.isArray(ch)) { chapters(ch, true); }
          else {
            ext = path.extname(ch.href);
            base = path.basename(ch.href, ext);
            dir = path.dirname(ch.href);
            url = path.resolve('/', dir, base + '.html');
          
            // FIXME: Render readme properly
            if (ch.href !== 'README.md') {
              //console.log('req: ' + url);
            
              //console.log('FOUND CHAPTER: ' + ch.href);
              page.locals.chapters.push(ch.href);
            
              //self.emit('request', url);
              //site.add(url);
            }
            if (ch.children) { chapters(ch.children, true); }
          }
        }
        if (!sub) {
          return next();
        }
        
        
      
        //console.log('BOOK DONE!');
        //self.emit('request', '/downloads/html.html')
      
      })(toc);
    
      //site.toc = toc;
      //return done();
    });
    
    
  }
  
  function renderContents(page, next) {
    page.locals.content = '';
    
    var site = page.app
      , contents = page.contents
      , content
      , i = 0;
    
    (function iter(err) {
      if (err) { return next(err); }
      
      content = contents[i++];
      if (!content) { return next(); } // done
       
      site.render(content.content, { engine: content.markup }, function(err, out) {
        if (err) { return iter(err); }
        
        page.locals.content += '<section class="' + clazz + '" id="' + content.id + '">';
        page.locals.content += out;
        page.locals.content += '</section>'
        iter();
      }, false);
    })();
  }
  
  function newRenderContents(page, next) {
    //console.log('RENDER CHAPTERS!');
    //console.log(page.locals.chapters);
    
    page.locals.content = '';
    
    var chapters = page.locals.chapters
      , chapter
      , i = 0;
    
    (function iter(err) {
      if (err) { return next(err); }
      
      chapter = chapters[i++];
      if (!chapter) { return next(); } // done
      
      //console.log(chapter)
      
      fs.readFile(path.resolve(dir, chapter), 'utf8', function(err, str) {
        if (err) { return iter(err); }
        
        //console.log(str);
        
        var data;
        try {
          data = fm.parse(str, page.app.fm.bind(page.app));
          //data = fm.parse(str);
        } catch (ex) {
          throw new Error('Failed to parse front matter from file: ' + chapter);
        }
        
        //console.log(data)
        
        var id = path.basename(chapter, path.extname(chapter))
        
        page.app.convert(data.content, { engine: 'md' }, function(err, out) {
          if (err) { return iter(err); }
        
          page.locals.content += '<section class="' + clazz + '" id="' + id + '">';
          page.locals.content += out;
          page.locals.content += '</section>'
          iter();
        });
        
        //iter();
        
      });
      
      
      
      /*
      content = contents[i++];
      if (!content) { return next(); } // done
       
      site.render(content.content, { engine: content.markup }, function(err, out) {
        if (err) { return iter(err); }
        
        page.locals.content += '<section class="' + clazz + '" id="' + content.id + '">';
        page.locals.content += out;
        page.locals.content += '</section>'
        iter();
      }, false);
      */
    })();
    
  }
  
  function render(page, next) {
    page.locals.title = title;
    page.render();
  }
  
  function newRender(page, next) {
    //console.log('RENDER!');
    
    page.locals.title = title;
    page.render();
  }
  
  function errorHandler(err, page, next) {
    //console.log('*** ERROR ***');
    //console.log(err);
  }
  
  
  return [
    kerouac.manifest(),
    kerouac.canonicalURL(),
    kerouac.layout(layout),
    //loadContents,
    newLoadContents,
    //renderContents,
    newRenderContents,
    //render,
    newRender,
    errorHandler
  ];
};
