var fs = require('fs')
  , path = require('path')
  , marked = require('marked')
  , ToCParser = require('../markdown/toc/parser')
  , ToCRenderer = require('../markdown/toc/renderer')
  , events = require('events')
  , util = require('util');


function DirectoryDriver(dir, book) {
  events.EventEmitter.call(this);
  this._root = dir;
  this._book = book;
}

util.inherits(DirectoryDriver, events.EventEmitter);

DirectoryDriver.prototype.start = function() {
  // TODO: Read config file
  //var readmeFile = options.summary || 'README.md'
  //  , tocFile = options.summary || 'SUMMARY.md';
  
  var self = this;
  this._book.chapters(function(err, chapters) {
    if (err) { return self.emit('error', err); }
    
    chapters.forEach(function(ch) {
      var ext = path.extname(ch.href);
      var base = path.basename(ch.href, ext);
      if (base == 'README') { base = 'index'; }
      
      // TODO: traverse subchapters
      
      self.request('/' + base + '.html');
    });
    
    self.request('/downloads/html.html');
    self.emit('finish');
  });
  
  
  return;
  
  // TODO: remove below here
  
  var self = this
    , root = this._root;
  
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
          ext = path.extname(ch.href);
          base = path.basename(ch.href, ext);
          dir = path.dirname(ch.href);
          url = path.resolve('/', dir, base + '.html');
          
          // FIXME: Render readme properly
          if (ch.href !== 'README.md') {
            //console.log('req: ' + url);
            
            //self.emit('request', url);
            //site.add(url);
            self.request(url);
          }
          if (ch.children) { chapters(ch.children); }
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


module.exports = DirectoryDriver;
