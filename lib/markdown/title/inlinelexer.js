var marked = require('marked')
  , util = require('util');


function InlineLexer(links, options) {
  marked.InlineLexer.call(this, links, options);
}

util.inherits(InlineLexer, marked.InlineLexer);

InlineLexer.prototype.output = function(src) {
  var cap;
  
  // text
  if (cap = this.rules.text.exec(src)) {
    src = src.substring(cap[0].length);
    return this.renderer.text(escape(cap[0]));
  }
}


/**
 * Helpers
 */

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


module.exports = InlineLexer;
