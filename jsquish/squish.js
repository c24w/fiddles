'use strict';
function showResult(title, text) {
  $('title').text(title);
  window.location.replace(encodeURI(`data:text/plain,${text}`));
}

window.onerror = err => {
  const url = `${window.location.href}`;
  const separator = new Array(url.length+1).join('-');
  const msg = `\n${err}\n\n${separator}\n${url}`;
  showResult(':(', msg);
};

function assertUrlPart(part) {
  if (!part) {
    const eg = `${window.location.pathname}?gist=github-username/gist-hash`;
    throw new Error(`URL should point to a gist, e.g. ${eg}`);
  }
}

function getScriptUrl() {
  const qs = window.location.search.slice(1);
  assertUrlPart(qs);
  const gist = qs.split('=')[1];
  assertUrlPart(gist);
  return `https://gist.githubusercontent.com/${gist}/raw`;
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
