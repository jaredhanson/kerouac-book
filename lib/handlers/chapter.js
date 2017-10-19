var fs = require('fs')
  , path = require('path')
  , kerouac = require('kerouac');


exports = module.exports = function(dir, inputFile) {
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
      file = path.resolve(dir, page.params[0] + ext);
      if (fs.existsSync(file)) {
        page.inputPath = file;
        return next();
      }
    }
  
    return next('route');
  }
  
  function meta(page, next) {
    page.post = true;
    page.title = page.locals.title;
    next();
  }
  
  
  return [
    findFile,
    kerouac.loadContent(),
    kerouac.timestamps(),
    meta,
    kerouac.render()
  ];
};
