var marked = require('marked')
  , util = require('util')
  , InlineLexer = require('./inlinelexer');


function Parser(options) {
  marked.Parser.call(this, options);
}
util.inherits(Parser, marked.Parser);

Parser.prototype.parse = function(src) {
  this.inline = new InlineLexer(src.links, this.options);
  this.tokens = src.reverse();

  var entry;
  while (this.next()) {
    entry = this.tok();
    if (entry) { return entry; }
  }
  return;
};

Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'heading': {
      return this.renderer.heading(
        this.inline.output(this.token.text),
        this.token.depth,
        this.token.text);
    }
  }
  
  marked.Parser.prototype.tok.call(this);
  return null;
};


module.exports = Parser;