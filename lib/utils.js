exports.fileType = function(format) {
  switch (format) {
  case 'md':
    return 'markdown';
  case 'adoc':
    return 'asciidoc';
  }
  return undefined;
};
