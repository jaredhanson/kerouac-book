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
 * stored on the file system in GitBook [directory structure](https://github.com/GitbookIO/gitbook/blob/master/docs/structure.md).
 */
function GitBook(root) {
  this._root = root;
  this._readme = 'README.md';
  this._summary = 'SUMMARY.md';
  
  
  var file = path.resolve(root, 'book.json')
    , data, config
    , tokens, renderer, parser, title;
  
  // Load the [configuration](https://github.com/GitbookIO/gitbook/blob/master/docs/config.md),
  // if it exists.
  if (fs.existsSync(file)) {
    try {
      config = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (ex) {
      throw new Error("Failed to parse GitBook configuration at '" + file + "'");
    }
    this.title = config.title;
    this.description = config.description;
    
    if (config.root) {
      // Resolve the directory where the book's files are located, for
      // integration with a [project subdirectory](https://github.com/GitbookIO/gitbook/blob/master/docs/structure.md#project-integration-with-subdirectory-subdirectory).
      this._root = path.resolve(root, config.root);
    }
    if (config.structure) {
      this._readme = config.structure.readme || 'README.md';
      this._summary = config.structure.summary || 'SUMMARY.md';
    }
  }
  
  file = path.resolve(this._root, this._readme);
  if (!fs.existsSync(file)) {
    throw new Error("Missing required GitBook readme at '" + file + "'");
  }
  
  if (!this.title) {
    // Extract the title from the README, if it was not specified in the
    // configuration (or configuration did not exist).
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

/**
 * Fetch chapters.
 *
 * This function yields the book's chapters.  The chapters are parsed from the
 * GitBook [summary](https://github.com/GitbookIO/gitbook/blob/master/docs/pages.md#summary),
 * which contains the book's table of contents.
 */
GitBook.prototype.chapters = function(options, cb) {
  if (typeof options == 'function') {
    cb = options;
    options = undefined;
  }
  options = options || {};
  
  fs.readFile(path.resolve(this._root, this._summary), 'utf8', function(err, text) {
    if (err) { return cb(err); }
    
    var tokens = marked.lexer(text);
    var renderer = new ToCRenderer();
    var parser = new ToCParser({ renderer: renderer });
    var toc = parser.parse(tokens);
    
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
    fs.readFile(fpath, 'utf8', function(err, text) {
      if (err) { return cb(err); }
      
      var doc = FrontMatter.parse(text);
      // TODO: Rename doc.head to doc.front?
      doc.format = ext.slice(1);
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
