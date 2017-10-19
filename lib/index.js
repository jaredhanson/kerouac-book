/**
 * Module dependencies.
 */
var kerouac = require('kerouac')
  , fs = require('fs')
  , path = require('path')
  , marked = require('marked')
  , ObjParser = require('./markdown/objparser')
  , ToCRenderer = require('./markdown/tocrenderer');


exports = module.exports = function(dir, options) {
  if (typeof dir == 'object') {
    options = dir;
    dir = options.dir;
  }
  dir = dir || 'book';
  options = options || {};
  
  var tocFile = options.summary || 'SUMMARY.md';
  
  
  var site = kerouac();
  
  console.log('NEW BOOK!');
  
  site.bind(function(done) {
    console.log('BIND BOOK!');
    
    var file = path.resolve(dir, tocFile);
    console.log(file);
    
    fs.readFile(file, 'utf8', function(err, text) {
      console.log('READ IT');
      console.log(err);
      console.log(text);
      
      if (err) { return done(err); }
      
      //var tokens = marked.lexer(text, { pedantic: true });
      //var lexer = new marked.Lexer(options);
      //var tokens = lexer.lex(text);
      
      var tokens = marked.lexer(text);
      var renderer = new ToCRenderer();
      var parser = new ObjParser({ renderer: renderer });
      
      console.log(tokens);
      
      var obj = parser.parse(tokens)
      
      console.log('OBJ!');
      console.log(obj)
      
      //console.log(tokens)
      
      //var renderer = new ToCRenderer();
      //var out = marked(text, { renderer: renderer })
      
      //console.log('OUTPUT!');
      //console.log(out)
      
      //console.log(tokens)
      //console.log(lexer.rules);
      
      return done();
      
    })
    
    /*
    var self = this
      , adir = path.resolve(dir)
      , rfile
    
    diveSync(adir, function(err, file) {
      if (err) { throw err; }
      
      console.log(file);
      
      rfile = path.relative(adir, file)
      console.log(rfile);
      
    });
    */
    
  });
  
  return site;
};
