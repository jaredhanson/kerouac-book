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

  var toc = []
    , entry;
  while (this.next()) {
    entry = this.tok();
    if (entry) { toc.push(entry); }
  }
  return toc;
};

Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'heading': {
      return this.renderer.heading(
        this.inline.output(this.token.text),
        this.token.depth,
        this.token.text);
    }
    case 'hr': {
      return this.renderer.hr();
    }
    case 'list_start': {
      var list = []
        , ordered = this.token.ordered;

      while (this.next().type !== 'list_end') {
        list.push(this.tok());
      }

      return this.renderer.list(list, ordered);
    }
    case 'list_item_start':
    case 'loose_item_start': {
      var item = {}
        , text;

      while (this.next().type !== 'list_item_end') {
        if (this.token.type === 'text') {
          text = this.parseText();
          item.title = text.title;
          item.href = text.href;
        } else {
          item.children = this.tok();
        }
      }

      return this.renderer.listitem(item);
    }
  }
  
  marked.Parser.prototype.tok.call(this);
  return null;
};


module.exports = Parser;