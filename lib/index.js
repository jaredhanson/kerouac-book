/**
 * Module dependencies.
 */
var kerouac = require('kerouac')
  , fs = require('fs')
  , path = require('path')
  , DirectoryDriver = require('./drivers/directory');


exports = module.exports = function(title, dir, options) {
  if (typeof dir == 'object') {
    options = dir;
    dir = options.dir;
  }
  dir = dir || 'book';
  options = options || {};
  
  var driver = new DirectoryDriver(dir);
  
  var readmeFile = options.summary || 'README.md'
    , tocFile = options.summary || 'SUMMARY.md';
  
  
  //var site = kerouac();
  var site = new kerouac.Router();
  
  site.driver = driver;
  
  /*
  site.on('mount', function onmount(parent) {
    // inherit settings
    this.set('layout engine', parent.get('layout engine'));
    
    this.locals.pretty = parent.locals.pretty;
  });
  */
  
  
  site.page('/index.html', require('./handlers/chapter')(title, dir, readmeFile, 'book/chapter'));
  site.page('/*.html', require('./handlers/chapter')(title, dir, false, 'book/chapter'));
  site.page('/downloads/html.html', require('./handlers/downloads/html')(title, dir, options.layout));
  
  return site;
};

exports.browser = function(dir) {
  return new DirectoryDriver(dir || 'book');
};
