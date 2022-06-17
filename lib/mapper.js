var events = require('events')
  , path = require('path')
  , util = require('util');


function GitBookMapper(book, download) {
  events.EventEmitter.call(this);
  this._book = book;
  this._download = download !== undefined ? download : false;
}

util.inherits(GitBookMapper, events.EventEmitter);

GitBookMapper.prototype.map = function() {
  var self = this;

  var paths = [];
  function request(path) {
    if (paths.indexOf(path) != -1) { return; }
    paths.push(path);
    self.request(path);
  }
  
  request('/index.html');
  
  this._book.contents(function(err, chapters) {
    if (err) { return self.emit('error', err); }
    
    function traverse(chapters) {
      chapters.forEach(function(ch) {
        var ext = path.extname(ch.path);
        var slug = ch.path.slice(0, ch.path.length - ext.length);
      
        if (ch.path != self._book._readme) {
          request('/' + slug + '.html');
        }
        
        if (ch.chapters) { traverse(ch.chapters); }
      });
    }
    
    if (chapters) { traverse(chapters); }
    
    // TODO: walk static files
    // https://github.com/GitbookIO/gitbook/blob/master/docs/structure.md#static-files-and-images
    // TODO: support ignore files
    // https://github.com/GitbookIO/gitbook/blob/master/docs/structure.md#ignoring-files--folders-ignore
    
    if (self._download) {
      self.request('/downloads/html.html');
    }
    self.emit('finish');
  });
}


module.exports = GitBookMapper;
