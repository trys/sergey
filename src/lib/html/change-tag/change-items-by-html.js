const domutils = require('domutils');
const { queryNodesByHTML } = require('../nodes');

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

  const { nodes: selectedNodes } = queryNodesByHTML({ html: base, selector });
  selectedNodes.forEach((i) => {
    const oldContent = modes[mode](i);
    const newContent = changeItem(i, oldContent);

    if(newContent !== false) {
      base = base.replace(oldContent, newContent);
    }
  });
  return base;
};
