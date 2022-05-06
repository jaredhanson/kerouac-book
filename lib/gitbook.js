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
    data = fs.readFileSync(file, 'utf8');
    
    tokens = marked.lexer(data);
    renderer = new TitleRenderer();
    parser = new TitleParser({ renderer: renderer });
    title = parser.parse(tokens);
    this.title = title;
  }
}

/**
 * List chapters.
 *
 * This function yields the book's chapters, as an array of objects in which
 * each object has a 'title' and 'path' property.
 *
 * @access public
 */
GitBook.prototype.chapters = function(options, cb) {
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
 * 'front', 'content', 'format', 'createdAt', and 'modifiedAt' properties.
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
  
  function readChapter(chapter, format) {
    var fpath = path.resolve(self._root, chapter.path);
    fs.readFile(fpath, 'utf8', function(err, text) {
      if (err) { return cb(err); }
      
      var doc = FrontMatter.parse(text);
      doc.front = doc.head;
      delete doc.head;
      doc.format = format;
      doc.title = chapter.title;
      
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
      if (slug == 'README') { return readChapter({ path: 'README.md', title: self.title }, 'md'); }
      return cb();
    }
    readChapter(chapter, ext.slice(1));
  });
};

/**
 * Fetch preface.
 *
 * This function yields a book's preface, as an object with the same structure
 * as a chapter.
 */
GitBook.prototype.preface = function(cb) {
  return this.chapter('README', cb);
};


module.exports = GitBook;
