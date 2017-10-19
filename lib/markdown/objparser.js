var marked = require('marked')
  , util = require('util')
  , InlineLexer = require('./objlexer');


function Parser(options) {
  marked.Parser.call(this, options);
}
util.inherits(Parser, marked.Parser);

Parser.prototype.parse = function(src) {
  //console.log('OVERRIDE PARSE!');
  //console.log(src)
  
  this.inline = new InlineLexer(src.links, this.options);
  this.tokens = src.reverse();

  var toc = [];
  while (this.next()) {
    var x = this.tok();
    console.log('******');
    console.log(JSON.stringify(x));
  }

  return toc;
  
  
  //return {};
};

Parser.prototype.tok = function() {
  //return undefined;
  
  switch (this.token.type) {
    case 'list_start': {
      console.log('# list_start');
      var list = []
        , ordered = this.token.ordered;

      while (this.next().type !== 'list_end') {
        list.push(this.tok());
      }
      
      console.log('### list_end:');
      console.log(list)

      return this.renderer.list(list, ordered);
    }
    case 'list_item_start': {
      console.log('# list_item_start');
      var item = {};

      while (this.next().type !== 'list_item_end') {
        //item = this.token.type === 'text'
        //  ? this.parseText()
        //  : this.tok();
        
        if (this.token.type === 'text') {
          var text = this.parseText();
          
          item.title = text.title;
          item.href = text.href;
        } else {
          item.children = this.tok();
        }
      }
      
      console.log('### list_item_end:');
      console.log(item)

      return this.renderer.listitem(item);
    }
  }
  
  //return '';
  
  marked.Parser.prototype.tok.call(this);
  return null;
};


module.exports = Parser;