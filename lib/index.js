/**
 * Module dependencies.
 */
var kerouac = require('kerouac');


exports = module.exports = function(dir, options) {
  if (typeof dir == 'object') {
    options = dir;
    dir = options.dir;
  }
  dir = dir || 'blog';
  options = options || {};
  
  
  var site = kerouac();
  
  return site;
};
