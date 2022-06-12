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
    
    if (self._download) {
      self.request('/downloads/html.html');
    }
    self.emit('finish');
  });
  
  
  return;
  
  // TODO: remove below here
  
  var self = this
    , root = this._root;
  
    // TODO: walk static files
    // https://github.com/GitbookIO/gitbook/blob/master/docs/structure.md#static-files-and-images
    // TODO: support ignore files
    // https://github.com/GitbookIO/gitbook/blob/master/docs/structure.md#ignoring-files--folders-ignore
  
  fs.readFile(path.resolve(root, 'SUMMARY.md'), 'utf8', function(err, text) {
    if (err) { return done(err); }
  
    var tokens = marked.lexer(text);
    var renderer = new ToCRenderer();
    var parser = new ToCParser({ renderer: renderer });
    var toc = parser.parse(tokens);
    
    //console.log(require('util').inspect(toc, false, null));
    
    //self.emit('request', '/index.html');
    self.request('/index.html');
    
    (function chapters(toc) {
      var ch, base, dir, ext, url
        , i, len;
      for (i = 0, len = toc.length; i < len; ++i) {
        ch = toc[i];
        if (ch.text || ch.divider) { continue; }
        
        if (Array.isArray(ch)) { chapters(ch); }
        else {
          ext = path.extname(ch.path);
          base = path.basename(ch.path, ext);
          dir = path.dirname(ch.path);
          url = path.resolve('/', dir, base + '.html');
          
          // FIXME: Render readme properly
          if (ch.path !== 'README.md') {
            //console.log('req: ' + url);
            
            //self.emit('request', url);
            //site.add(url);
            self.request(url);
          }
          if (ch.chapters) { chapters(ch.chapters); }
        }
      }
      //self.emit('request', '/downloads/html.html');
      
    })(toc);
    
    self.request('/downloads/html.html');
    self.emit('finish');
    
    //site.toc = toc;
    //return done();
  });
}


module.exports = GitBookMapper;
