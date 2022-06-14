var events = require('events')
  , path = require('path')
  , util = require('util');


function GitBookMapper(book, download) {
  events.EventEmitter.call(this);
  this._book = book;
  this._download = download !== undefined ? download : true;
}

util.inherits(GitBookMapper, events.EventEmitter);

GitBookMapper.prototype.map = function() {
  // TODO: Read config file
  //var readmeFile = options.summary || 'README.md'
  //  , tocFile = options.summary || 'SUMMARY.md';
  
  // TODO: Emit README path, if not in summary
  
  var self = this;
  this._book.contents(function(err, chapters) {
    if (err) { return self.emit('error', err); }
    
    if (!chapters) {
      chapters = [ { path: self._book._readme } ];
    }
    
    //console.log('BROWSE IT!');
    //console.log(chapters[0].path);
    if (chapters[0].path != 'README.md') {
      self.request('/index.html')
    }
    
    function traverse(chapters) {
      chapters.forEach(function(ch) {
        var ext = path.extname(ch.path);
        var slug = ch.path.slice(0, ch.path.length - ext.length);
      
        if (ch.path == self._book._readme) {
          self.request('/index.html');
        } else {
          self.request('/' + slug + '.html');
        }
        
        if (ch.chapters) { traverse(ch.chapters); }
      });
    }
    
    traverse(chapters);
    
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
