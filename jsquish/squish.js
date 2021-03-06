'use strict';
function showResult(title, text) {
  $('head').html(`<title>${title}</title>`);
  $('body').html(`<pre>${text}</pre>`);
}

window.onerror = err => {
  const url = `${window.location.href}`;
  const separator = new Array(url.length+1).join('-');
  const msg = `\n${err}\n\n${separator}\n${url}`;
  showResult(':(', msg);
};

function assertQs(condition) {
  if (!condition) {
    const eg = `${window.location.pathname}?gist=github-username/gist-hash/[filename]`;
    throw new Error(`URL should point to a gist, e.g. ${eg}`);
  }
}

function getScriptUrl() {
  const qs = window.location.search.slice(1);
  assertQs(qs);
  const gist = qs.split('=')[1];
  assertQs(gist);
  const gistParts = gist.split('/');
  const file = gistParts.length === 3 ? gistParts.pop() : '';
  return `https://gist.githubusercontent.com/${gistParts.join('/')}/raw/${file}`;
}

$.get(getScriptUrl())
.done(res => {
  $.post({
    url: 'https://closure-compiler.appspot.com/compile',
    dataType: 'text',
    data: {
      js_code: res,
      //code_url: `https://gist.githubusercontent.com/${gist}/raw`,
      output_format: 'text',
      output_info: 'compiled_code',
      compilation_level: 'SIMPLE_OPTIMIZATIONS',
      warning_level: 'default'
    }
  })
  .done(res => showResult('/* squished */', res))
  .fail((jqXhq, status, err) => {
    throw new Error(`Couldn't minify gist: ${status}, ${err}`);
  });
})
.fail((jqXhq, status, err) => {
  throw new Error(`Couldn't fetch gist: ${status}, ${err}`);
});
