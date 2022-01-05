var path = require('path');
var fs = require('fs');
var FrontMatter = require('headmatter');
var marked = require('marked');
var flatten = require('utils-flatten');
var ToCParser = require('./markdown/toc/parser')
var ToCRenderer = require('./markdown/toc/renderer')


function GitBook(root) {
  this._root = root;
}

GitBook.prototype.chapters = function(options, cb) {
  if (typeof options == 'function') {
    cb = options;
    options = undefined;
  }
  options = options || {};
  
  fs.readFile(path.resolve(this._root, 'SUMMARY.md'), 'utf8', function(err, txt) {
    //console.log(err);
    //console.log(txt);
    
    if (err) { return cb(err); }
    
    var tokens = marked.lexer(txt);
    //console.log(tokens);
    var renderer = new ToCRenderer();
    var parser = new ToCParser({ renderer: renderer });
    var toc = parser.parse(tokens);
    //console.log(toc);
    //console.log(toc[0][0].children)
    //console.log(toc[0][1].children)
    
    
    if (options.includeParts) {
      return cb(null, toc);
    }
    return cb(null, flatten(toc.filter(function(e) { return Array.isArray(e); })));
    
    //return cb(null, toc[0]);
    
    //return cb(null, { title: 'Foo' });
  });
  
  
  //return cb(null, { title: 'Foo' });
  
};

GitBook.prototype.chapter = function(slug, cb) {
  var self = this;
  this.chapters(function(err, chapters) {
    if (err) { return cb(err); }
    
    var ext, base;
    var chapter = chapters.find(function(ch) {
      ext = path.extname(ch.href);
      base = path.basename(ch.href, ext);
      
      return slug === base;
    })
    
    // TODO: Load the file
    
    
    
    if (!chapter) { return cb(); }
    
    
    fs.readFile(path.resolve(self._root, chapter.href), 'utf8', function(err, txt) {
      if (err) { return cb(err); }
      
      var doc = FrontMatter.parse(txt);
      // TODO: Rename doc.head to doc.front?
      doc.title = chapter.title;
      doc.type = ext.slice(1);
      return cb(null, doc);
    });
  });
  
};


module.exports = GitBook;
