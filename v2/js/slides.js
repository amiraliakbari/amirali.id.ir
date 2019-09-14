var hljs = remark.highlighter.engine;
hljs.registerLanguage('remark', function () {
  return {
    contains: [
      {
        className: 'keyword',
        begin: '^#+[^\n]+',
        relevance: 10
      },
      {
        className: 'comment',
        begin: '^---?'
      },
      {
        className: 'string',
        begin: '^\\w+:'
      },
      {
        className: 'literal',
        begin: '\\{\\{', end: '\\}\\}'
      },
      {
        className: 'string',
        begin: '\\.\\w+'
      }
    ]
  };
});

var slideshow = remark.create({
  highlightStyle: 'monokai',
  highlightLanguage: 'remark',
  highlightLines: true
}) ;

