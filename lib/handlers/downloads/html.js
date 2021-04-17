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
  
  function render(page, next) {
    page.locals.title = title;
    page.render();
  }
  
  
  return [
    kerouac.manifest(),
    kerouac.canonicalURL(),
    kerouac.layout(layout),
    loadContents,
    renderContents,
    render
  ];
};
