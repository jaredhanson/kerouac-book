var marked = require('marked')
  , util = require('util');


function InlineLexer(links, options) {
  marked.InlineLexer.call(this, links, options);
}

util.inherits(InlineLexer, marked.InlineLexer);

InlineLexer.prototype.output = function(src) {
  // link
  if (cap = this.rules.link.exec(src)) {
    src = src.substring(cap[0].length);
    return this.outputLink(cap, {
      href: cap[2],
      title: cap[3]
    });
  }
  
  // text
  if (cap = this.rules.text.exec(src)) {
    src = src.substring(cap[0].length);
    return this.renderer.text(escape(cap[0]));
  }
}

InlineLexer.prototype.outputLink = function(cap, link) {
  var href = escape(link.href)
    , title = link.title ? escape(link.title) : null;
  
  return this.renderer.link(href, title, this.output(cap[1]));
};


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
