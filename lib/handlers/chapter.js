var fs = require('fs')
  , path = require('path')
  , kerouac = require('kerouac');


exports = module.exports = function(title, dir, inputFile, layout) {
  var exts = [ '.md' ];
  
  
  function findFile(page, next) {
    var file, ext
      , i, len;
  
    if (inputFile) {
      file = path.resolve(dir, inputFile);
      if (fs.existsSync(file)) {
        page.inputPath = file;
        return next();
      }
      return next('route');
    }
  
    for (i = 0, len = exts.length; i < len; ++i) {
      ext = exts[i];
      
      //console.log('RESOLVING: ' + page.params[0]);
      
      file = path.resolve(dir, page.params[0] + ext);
      if (fs.existsSync(file)) {
        page.inputPath = file;
        return next();
      }
    }
  
    return next('route');
  }
  
  function meta(page, next) {
    page.locals.title = page.locals.title ? title + ': ' + page.locals.title : title;
    next();
  }
  
  
  return [
    kerouac.manifest(),
    kerouac.canonicalURL(),
    findFile,
    kerouac.timestamps(),
    kerouac.layout(layout),
    kerouac.loadContent(),
    meta,
    kerouac.render()
  ];
};
