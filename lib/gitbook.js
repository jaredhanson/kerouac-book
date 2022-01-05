var path = require('path');
var fs = require('fs');


function GitBook(root) {
  this._root = root;
}

GitBook.prototype.chapters = function(cb) {
  console.log('GET CHAPTERS!');
  
  fs.readFile(path.resolve(this._root, 'SUMMARY.md'), 'utf8', function(err, text) {
    console.log(err);
    console.log(text);
    
    if (err) { return cb(err); }
    
    console.log('calling back');
    return cb(null, { title: 'Foo' });
  });
  
  
  //return cb(null, { title: 'Foo' });
  
}


module.exports = GitBook;
