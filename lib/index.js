/**
 * Module dependencies.
 */
var kerouac = require('kerouac')
  , fs = require('fs')
  , path = require('path')
  , marked = require('marked')
  , ToCParser = require('./markdown/toc/parser')
  , ToCRenderer = require('./markdown/toc/renderer');


exports = module.exports = function(dir, options) {
  if (typeof dir == 'object') {
    options = dir;
    dir = options.dir;
  }
  dir = dir || 'book';
  options = options || {};
  
  var readmeFile = options.summary || 'README.md'
    , tocFile = options.summary || 'SUMMARY.md';
  
  
  var site = kerouac();
  
  site.on('mount', function onmount(parent) {
    // inherit settings
    this.set('layout engine', parent.get('layout engine'));
    
    this.locals.pretty = parent.locals.pretty;
  });
  
  
  //site.page('/index.html', require('./handlers/chapter')(dir, readmeFile, options.layout));
  site.page('/*.html', require('./handlers/chapter')(dir, false, options.layout));
  site.page('/downloads/html.html', require('./handlers/downloads/html')(dir, options.layout));
  
  site.bind(function(done) {
    var self = this
      , file = path.resolve(dir, tocFile);
      
    fs.readFile(file, 'utf8', function(err, text) {
      if (err) { return done(err); }
      
      var tokens = marked.lexer(text);
      var renderer = new ToCRenderer();
      var parser = new ToCParser({ renderer: renderer });
      var toc = parser.parse(tokens)
      
      console.log(require('util').inspect(toc, false, null));
      
      (function chapters(toc) {
        var ch, base, dir, ext, url
          , i, len
        for (i = 0, len = toc.length; i < len; ++i) {
          ch = toc[i];
          if (ch.text || ch.divider) { continue; }
          
          if (Array.isArray(ch)) { chapters(ch); }
          else {
            ext = path.extname(ch.href);
            base = path.basename(ch.href, ext);
            dir = path.dirname(ch.href);
            url = path.resolve('/', dir, base + '.html');
            
            if (ch.href !== 'README.md') {
              self.add(url);
            }
            if (ch.children) { chapters(ch.children); }
          }
        }
      })(toc);
      
      site.toc = toc;
      return done();
    });
  });
  
  return site;
};
