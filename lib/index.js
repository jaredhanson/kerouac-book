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
  
  var tocFile = options.summary || 'SUMMARY.md';
  
  
  var site = kerouac();
  
  site.bind(function(done) {
    var self = this
      , file = path.resolve(dir, tocFile);
      
    fs.readFile(file, 'utf8', function(err, text) {
      if (err) { return done(err); }
      
      var tokens = marked.lexer(text);
      var renderer = new ToCRenderer();
      var parser = new ToCParser({ renderer: renderer });
      var toc = parser.parse(tokens)
      
      function bindChapters(toc) {
        var ch, i, len;
        for (i = 0, len = toc.length; i < len; ++i) {
          ch = toc[i];
          if (ch.text || ch.divider) { continue; }
          
          if (Array.isArray(ch)) { bindChapters(ch); }
          else {
            //self.add('/' + ch.href);
            if (ch.children) { bindChapters(ch.children); }
          }
        }
      }
      
      bindChapters(toc);
      return done();
    });
  });
  
  return site;
};
