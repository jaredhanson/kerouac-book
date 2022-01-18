function Renderer(options) {
  this.options = options || {};
}

Renderer.prototype.code = function(code, lang, escaped) {
}

Renderer.prototype.blockquote = function(quote) {
}

Renderer.prototype.html = function(html) {
}

Renderer.prototype.heading = function(text, level, raw) {
  if (level == 3) { return { title: text }; }
}

Renderer.prototype.hr = function() {
  return { divider: true };
}

Renderer.prototype.list = function(list, ordered) {
  return list;
}

Renderer.prototype.listitem = function(item) {
  return item;
}

Renderer.prototype.paragraph = function(text) {
}

Renderer.prototype.table = function(header, body) {
}

Renderer.prototype.tablerow = function(content) {
}

Renderer.prototype.tablecell = function(content, flags) {
}

Renderer.prototype.strong = function(text) {
}

Renderer.prototype.em = function(text) {
}

Renderer.prototype.codespan = function(text) {
}

Renderer.prototype.br = function() {
}

Renderer.prototype.del = function(text) {
}

Renderer.prototype.link = function(href, title, text) {
  return { title: text, path: href };
}

Renderer.prototype.image = function(href, title, text) {
}

Renderer.prototype.text = function(text) {
  return text;
}


module.exports = Renderer;
