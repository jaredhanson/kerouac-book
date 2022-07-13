var path = require('path');

module.exports = function() {
  
  return function filters(page, next) {
    page.locals.filters = {};
    page.locals.filters.resolveFile = function(p) {
      // TODO: clean this up, make it handle pretty urls, etc
      var ext = path.extname(p);
      var base = p.slice(0, p.length - ext.length);
      if (base == 'README') { base = '' }
      var ih = ext.indexOf('#');
      
      return path.resolve(page.basePath || '/', base) + '/' + (ih != -1 ? ext.slice(ih) : '');
    };
    
    next();
  };
};
