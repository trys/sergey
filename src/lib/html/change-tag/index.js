const changeItemsByHTML = require('./change-items-by-html');
const changeItemsByHTMLFallback = require('./change-items-by-html-fallback');

/**
 * @author Gabriel Rodrigues <jipacoding@gmail.com>
 */
function main(options, fn) {
  const { html: html_, selector, mode = 'outerHTML' } = options;
  let html = html_;

  const changeItem = (i) => fn(i);
  html = changeItemsByHTML(Object.assign({}, options, { html, changeItem }));
  html = changeItemsByHTMLFallback(
    Object.assign({}, options, { html, changeItem })
  );

  return html;
}

module.exports = { main, changeItemsByHTML, changeItemsByHTMLFallback };
