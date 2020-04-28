const { parseDOM } = require('htmlparser2');
const { selectAll } = require('css-select');
const domutils = require('domutils');

const defaultModes = {
  innerHTML: domutils.getInnerHTML,
  outerHTML: domutils.getOuterHTML,
};

/**
 * Core function to change tags
 * @author Gabriel Rodrigues <jipacoding@gmail.com>
 */
module.exports = ({
  html,
  selector,
  changeItem,
  mode = 'outerHTML',
  modes = defaultModes,
  base: base_,
}) => {
  let base = html || base_ || '';

  const nodes = parseDOM(base);
  const selectedNodes = selectAll(selector, nodes);
  selectedNodes.forEach((i) => {
    const oldContent = modes[mode](i);
    const newContent = changeItem(i, oldContent);
    base = base.replace(oldContent, newContent);
  });
  return base;
};
