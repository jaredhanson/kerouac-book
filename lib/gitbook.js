var path = require('path');
var fs = require('fs');
var FrontMatter = require('headmatter');
var marked = require('marked');
var TitleParser = require('./markdown/title/parser')
var TitleRenderer = require('./markdown/title/renderer')
var ToCParser = require('./markdown/toc/parser');
var ToCRenderer = require('./markdown/toc/renderer');
var flatten = require('utils-flatten');


/**
 * GitBook.
 *
 * This class implements a `Book` interface, where the underlying content is
 * stored on the file system in [GitBook structure](https://github.com/GitbookIO/gitbook/blob/master/docs/structure.md).
 */
function GitBook(root, title) {
  this._root = root;
  this._readme = 'README.md';
  this._summary = 'SUMMARY.md';
  
  
  var file = path.resolve(root, 'book.json')
    , data, config
    , tokens, renderer, parser, title;
  
  if (fs.existsSync(file)) {
    config = JSON.parse(fs.readFileSync(file, 'utf8'));
    this.title = config.title;
    this.description = config.description;
    
    if (config.root) {
      this._root = path.resolve(root, config.root);
    }
    if (config.structure) {
      this._readme = config.structure.readme || 'README.md';
      this._summary = config.structure.summary || 'SUMMARY.md';
    }
  }
  
  if (!this.title) {
    file = path.resolve(this._root, this._readme);
    if (fs.existsSync(file)) {
      data = fs.readFileSync(file, 'utf8');
      
      tokens = marked.lexer(data);
      renderer = new TitleRenderer();
      parser = new TitleParser({ renderer: renderer });
      title = parser.parse(tokens);
      this.title = title;
    }
  }
}

GitBook.prototype.chapters = function(options, cb) {
  if (typeof options == 'function') {
    cb = options;
    options = undefined;
  }
  options = options || {};
  
  // TODO: replace this with _summary, which is currently not working for tutorial
  fs.readFile(path.resolve(this._root, 'SUMMARY.md'), 'utf8', function(err, txt) {
    if (err) { return cb(err); }
    
    var tokens = marked.lexer(txt);
    //console.log(tokens);
    var renderer = new ToCRenderer();
    var parser = new ToCParser({ renderer: renderer });
    var toc = parser.parse(tokens);
    //console.log(toc);
    
    // TODO: Rename "children" to "subchapters"
    // TODO: Simplify parts structure to object with name and chapters properties
    
    //console.log(toc);
    //console.log(toc[0][0].children)
    //console.log(toc[0][1].children)
    
    
    if (options.includeParts) {
      return cb(null, toc);
    }
    
    // TODO: Does this flatten subchapters?  Should it?  Probably not.
    return cb(null, flatten(toc.map(function(e) { return e.href ? e : e.chapters; })));
    
    //return cb(null, flatten(toc.filter(function(e) { return Array.isArray(e); })));
  });
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
    
    if (!chapter) { return cb(); }
    
    var fpath = path.resolve(self._root, chapter.href);
    fs.readFile(fpath, 'utf8', function(err, txt) {
      if (err) { return cb(err); }
      
      var doc = FrontMatter.parse(txt);
      // TODO: Rename doc.head to doc.front?
      doc.type = ext.slice(1);
      doc.title = chapter.title;
      
      fs.stat(fpath, function(err, stat) {
        if (err) { return cb(err); }
        doc.createdAt = stat.birthtime;
        doc.modifiedAt = stat.mtime;
        return cb(null, doc);
      });
    });
  });
};


module.exports = GitBook;
