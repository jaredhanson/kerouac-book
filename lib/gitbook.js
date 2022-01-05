var path = require('path');
var fs = require('fs');
var marked = require('marked');
var ToCParser = require('./markdown/toc/parser')
var ToCRenderer = require('./markdown/toc/renderer')


function GitBook(root) {
  this._root = root;
}

GitBook.prototype.chapters = function(cb) {
  console.log('GET CHAPTERS!');
  
  fs.readFile(path.resolve(this._root, 'SUMMARY.md'), 'utf8', function(err, txt) {
    console.log(err);
    console.log(txt);
    
    if (err) { return cb(err); }
    
    var tokens = marked.lexer(txt);
    var renderer = new ToCRenderer();
    var parser = new ToCParser({ renderer: renderer });
    var toc = parser.parse(tokens);
    console.log(toc[0]);
    console.log(toc[0][0].children)
    console.log(toc[0][1].children)
    
    
    return cb(null, toc[0]);
    
    //return cb(null, { title: 'Foo' });
  });
  
  
  //return cb(null, { title: 'Foo' });
  
}


module.exports = GitBook;
