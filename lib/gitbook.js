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
    if (err && err.code == 'ENOENT') {
      return cb(null);
    } else if (err) { return cb(err); }
    
    var tokens = marked.lexer(text);
    var renderer = new ToCRenderer();
    var parser = new ToCParser({ renderer: renderer });
    var toc = parser.parse(tokens);
    
    //console.log(toc)
    
    if (options.includeParts) {
      return cb(null, toc);
    }
    
    return cb(null, flatten(toc.map(function(e) { return e.path ? e : e.chapters; })));
  });
};

/**
 * Fetch chapter.
 *
 * This function yields a chapter of the book.  The chapters are parsed from
 * GitBook [pages](https://github.com/GitbookIO/gitbook/blob/master/docs/pages.md#pages),
 * which are typically formatted with [Markdown](https://daringfireball.net/projects/markdown/)
 * syntax and can contain optional front matter.
 */
GitBook.prototype.chapter = function(slug, cb) {
  var self = this;
  
  if (slug == 'index') { slug = 'README'; }
  
  function readChapter(name, format, title) {
    var fpath = path.resolve(self._root, name);
    fs.readFile(fpath, 'utf8', function(err, text) {
      if (err) { return cb(err); }
      
      var doc = FrontMatter.parse(text);
      // TODO: Rename doc.head to doc.front?
      doc.format = format;
      doc.title = title;
      
      fs.stat(fpath, function(err, stat) {
        if (err) { return cb(err); }
        doc.createdAt = stat.birthtime;
        doc.modifiedAt = stat.mtime;
        return cb(null, doc);
      });
    });
  }
  
  this.chapters(function(err, chapters) {
    if (err) { return cb(err); }
    
    var ext, base;
    var chapter = chapters.find(function(ch) {
      ext = path.extname(ch.path);
      base = ch.path.slice(0, ch.path.length - ext.length);
      
      return slug === base;
    })
    
    if (!chapter) {
      if (slug == 'README') { return readChapter('README.md', 'md'); }
      return cb();
    }
    readChapter(chapter.path, ext.slice(1), chapter.title);
  });
};


module.exports = GitBook;
