var fs = require('fs')
  , path = require('path')
  , marked = require('marked')
  , ToCParser = require('../markdown/toc/parser')
  , ToCRenderer = require('../markdown/toc/renderer')
  , events = require('events')
  , util = require('util');


function DirectoryDriver(dir) {
  events.EventEmitter.call(this);
  this._root = dir;
}

util.inherits(DirectoryDriver, events.EventEmitter);

//DirectoryDriver.prototype.bind = function(site, done) {
DirectoryDriver.prototype.go = function() {
  // TODO: Read config file
  //var readmeFile = options.summary || 'README.md'
  //  , tocFile = options.summary || 'SUMMARY.md';
  
  var self = this
    , root = this._root;
  
  fs.readFile(path.resolve(root, 'SUMMARY.md'), 'utf8', function(err, text) {
    if (err) { return done(err); }
  
    var tokens = marked.lexer(text);
    var renderer = new ToCRenderer();
    var parser = new ToCParser({ renderer: renderer });
    var toc = parser.parse(tokens);
    
    //console.log(require('util').inspect(toc, false, null));
    
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
            self.emit('request', url);
            //site.add(url);
          }
          if (ch.children) { chapters(ch.children); }
        }
      }
    })(toc);
    
    //site.toc = toc;
    //return done();
  });
}


module.exports = DirectoryDriver;
