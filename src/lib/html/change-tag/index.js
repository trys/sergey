const uid = require('uid');
const domutils = require('domutils');
const changeItemsByHTML = require('./change-items-by-html');
const changeItemsByHTMLFallback = require('./change-items-by-html-fallback');

const returnModes = {
  outerHTML: domutils.getOuterHTML,
  innerHTML: domutils.getInnerHTML,
};

/**
 * @author Gabriel Rodrigues <jipacoding@gmail.com>
 */
function main(options, fn) {
  const { html: html_, selector, mode = 'outerHTML' } = options;
  let html = html_;

  const changeItemNodeId = `sergey-node_id-${uid(6)}`;
  const changeItem = (node, ...args) => {
    if (typeof node.attribs[changeItemNodeId] === 'undefined') {
      node.attribs[changeItemNodeId] = '';
      return fn(node, ...args);
    }
    return false;
  };

  html = changeItemsByHTML(Object.assign({}, options, { html, changeItem }));
  html = changeItemsByHTMLFallback(
    Object.assign({}, options, { html, changeItem })
  );

  html = html.replace(new RegExp(` ?${changeItemNodeId}`, 'g'), '');
  return html;
}

module.exports = { main, changeItemsByHTML, changeItemsByHTMLFallback };
