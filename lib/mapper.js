var events = require('events')
  , path = require('path')
  , dive = require('dive')
  , util = require('util');


function GitBookMapper(book, download) {
  events.EventEmitter.call(this);
  this._book = book;
  this._download = download !== undefined ? download : false;
}

util.inherits(GitBookMapper, events.EventEmitter);

GitBookMapper.prototype.map = function() {
  var self = this;

  var paths = [
    'book.json',
    this._book._readme,
    this._book._summary,
    this._book._glossary,
    this._book._languages
  ];
  function request(path) {
    self.request(path);
  }
  
  request('/index.html');
  
  this._book.contents(function(err, chapters) {
    if (err) {
      self.emit('error', err);
      self.end();
      return;
    }
    
    function traverse(chapters) {
      chapters.forEach(function(ch) {
        var ext = path.extname(ch.path);
        var ih = ext.indexOf('#');
        var slug = ch.path.slice(0, ch.path.length - ext.length);
        var p = ch.path.slice(0, ch.path.length - (ih != -1 ? ext.length - ih : 0));
        
        if (paths.indexOf(p) != -1) { return; }
        paths.push(p);
        
        request('/' + slug + '.html');
        
        if (ch.chapters) { traverse(ch.chapters); }
      });
    }
    
    if (chapters) { traverse(chapters); }
    
    // Enumerate the files in the book's directory, finding any static files not
    // listed in the book's contents.  These files will be requested so that
    // they are copied to the output directory.
    dive(self._book._root, function(err, file, stat) {
      if (err) { return; }
      
      var p = path.relative(self._book._root, file);
      if (paths.indexOf(p) != -1) { return; }
      
      self.request('/' + p);
    }, function() {
      if (self._download) {
        self.request('/downloads/html.html');
      }
      self.end();
    });
    
    // TODO: support ignore files
    // https://github.com/GitbookIO/gitbook/blob/master/docs/structure.md#ignoring-files--folders-ignore
  });
}


module.exports = GitBookMapper;
