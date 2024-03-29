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
 * This class represents a book, where the underlying content is stored on the
 * filesystem in the {@link https://github.com/GitbookIO/gitbook/blob/master/docs/structure.md directory structure}
 * used by the {@link https://github.com/GitbookIO/gitbook GitBook} format.
 */
function GitBook(root) {
  this._root = root;
  this._readme = 'README.md';
  this._summary = 'SUMMARY.md';
  this._glossary = 'GLOSSARY.md';
  this._languages = 'LANGS.md';
  
  var file = path.resolve(root, 'book.json')
    , data, config
    , tokens, renderer, parser, title;
  
  if (fs.existsSync(file)) {
    // Parse the [configuration][1] file.
    //
    // [1]: https://github.com/GitbookIO/gitbook/blob/master/docs/config.md
    try {
      config = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (ex) {
      throw new Error("Failed to parse GitBook configuration at '" + file + "'");
    }
    this.title = config.title;
    this.description = config.description;
    this.config = config;
    
    if (config.root) {
      // For projects using a subdirectory to store the book for documentation,
      // set the [root][1] directory to what is configured.
      //
      // [1]: https://github.com/GitbookIO/gitbook/blob/master/docs/structure.md#project-integration-with-subdirectory-subdirectory
      this._root = path.resolve(root, config.root);
    }
    if (config.structure) {
      this._readme = config.structure.readme || 'README.md';
      this._summary = config.structure.summary || 'SUMMARY.md';
      this._glossary = config.structure.glossary || 'GLOSSARY.md';
      this._languages = config.structure.languages || 'LANGS.md';
    }
  }
  
  file = path.resolve(this._root, this._readme);
  if (!fs.existsSync(file)) {
    throw new Error("Missing required GitBook readme at '" + file + "'");
  }
  
  if (!this.title) {
    // Extract the title from the README, if it was not specified in the
    // configuration (or configuration did not exist).
    data = fs.readFileSync(file, 'utf8');
    
    tokens = marked.lexer(data);
    renderer = new TitleRenderer();
    parser = new TitleParser({ renderer: renderer });
    title = parser.parse(tokens);
    this.title = title;
  }
}

/**
 * List contents.
 *
 * This function yields the book's table of contents, as an array of objects in
 * which each object has a 'title' and 'path' property.
 *
 * @access public
 */
GitBook.prototype.contents = function(options, cb) {
  if (typeof options == 'function') {
    cb = options;
    options = undefined;
  }
  options = options || {};
  
  // Read and parse the [summary][1] file, which lists the chapters of the book.
  //
  // [1]: https://github.com/GitbookIO/gitbook/blob/master/docs/pages.md#summary
  fs.readFile(path.resolve(this._root, this._summary), 'utf8', function(err, text) {
    if (err && err.code == 'ENOENT') {
      return cb(null);
    } else if (err) { return cb(err); }
    
    var tokens = marked.lexer(text);
    var renderer = new ToCRenderer();
    var parser = new ToCParser({ renderer: renderer });
    var toc = parser.parse(tokens);
    
    if (options.includeParts) {
      return cb(null, toc);
    }
    return cb(null, flatten(toc.map(function(e) { return e.path ? e : e.chapters; })));
  });
};

/**
 * Fetch chapter.
 *
 * This function yields a book's chapter, as an object in which has 'title',
 * 'front', 'content', 'path', 'format', 'createdAt', and 'modifiedAt'
 * properties.
 *
 * The 'title' property is set to the chapter's title, as parsed from the
 * {@link https://github.com/GitbookIO/gitbook/blob/master/docs/pages.md#summary summary}
 * (or, in the case of a book which does not have a summary, from the readme).
 *
 * The remaining properties are parsed from the {@link https://github.com/GitbookIO/gitbook/blob/master/docs/pages.md#pages page}
 * on the file system.  The 'front' property contains variables set in the front
 * matter of the page.  The 'content' property contains the page's content, in
 * the format indicated by the 'format' property.  The value of 'format' is set
 * to the page's file extension, and is typically 'md' (for {@link https://daringfireball.net/projects/markdown/ Markdown})
 * or 'adoc' (for {@link https://en.wikipedia.org/wiki/AsciiDoc AciiDoc}).
 */
GitBook.prototype.chapter = function(slug, cb) {
  var self = this;
  
  this.contents(function(err, chapters) {
    if (err) { return cb(err); }
    if (!chapters) { return cb(null, undefined); }
    
    function find(chapters) {
      var i, len
        , ch, ext, base;
      for (i = 0, len = chapters.length; i < len; ++i) {
        ch = chapters[i];
        ext = path.extname(ch.path);
        base = ch.path.slice(0, ch.path.length - ext.length);
        if (slug == base) {
          return ch;
        }
        if (ch.chapters) {
          ch = find(ch.chapters);
          if (ch) { return ch; }
        }
      }
    }
    
    var chapter = find(chapters);
    if (!chapter) { return cb(null, undefined); }
    loadChapter(self._root, chapter, cb);
  });
};

/**
 * Fetch preface.
 *
 * This function yields a book's preface, as an object with the same structure
 * as a chapter.
 */
GitBook.prototype.preface = function(cb) {
  var self = this;
  var ext, base;
  ext = path.extname(this._readme);
  base = this._readme.slice(0, this._readme.length - ext.length);
  
  this.chapter(base, function(err, chapter) {
    if (err) { return cb(err); }
    if (chapter) { return cb(null, chapter); }
    return loadChapter(self._root, { path: self._readme, title: self.title }, cb);
  });
};


function loadChapter(root, chapter, cb) {
  var p = chapter.path;
  var ext = path.extname(p);
  var ih = ext.indexOf('#');
  if (ih != -1) {
    p = p.slice(0, p.length - ext.length + ih);
    ext = ext.slice(0, ih);
  }
  
  var fpath = path.resolve(root, p);
  fs.readFile(fpath, 'utf8', function(err, text) {
    if (err) { return cb(err); }
    
    var doc = FrontMatter.parse(text);
    doc.front = doc.head;
    delete doc.head;
    doc.format = ext.slice(1);
    doc.path = p;
    doc.href = chapter.path;
    doc.title = chapter.title;
    
    fs.stat(fpath, function(err, stat) {
      if (err) { return cb(err); }
      doc.createdAt = stat.birthtime;
      doc.modifiedAt = stat.mtime;
      return cb(null, doc);
    });
  });
}


module.exports = GitBook;
