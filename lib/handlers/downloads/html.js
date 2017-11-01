var kerouac = require('kerouac')
  , path = require('path');


exports = module.exports = function(dir, layout) {
  
  function loadContents(page, next) {
    var site = page.site
    
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
    
    var site = page.site
      , contents = page.contents
      , content
      , i = 0;
    
    (function iter(err) {
      if (err) { return next(err); }
      
      content = contents[i++];
      if (!content) { return next(); } // done
       
      site.render(content.content, { engine: content.markup }, function(err, out) {
        if (err) { return iter(err); }
        
        page.locals.content += '<section id="' + content.id + '">';
        page.locals.content += out;
        page.locals.content += '</section>'
        iter();
      }, false);
    })();
  }
  
  function render(page, next) {
    page.render();
  }
  
  
  return [
    kerouac.layout(layout),
    loadContents,
    renderContents,
    kerouac.manifest(),
    render
  ];
};
