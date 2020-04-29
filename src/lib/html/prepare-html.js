const { parseDOM } = require('htmlparser2');
const { getOuterHTML } = require('domutils');
const VOID_ELEMENTS = require('./voidelements.json');

// `<sergey-slot ...args />` -> `<sergey-slot ...args></sergey-slot>`
// the function ignores void elements like `<img />`
module.exports = (html_) => {
  let html = html_ || '';
  if (!html.trim()) return html;

  (html.match(/<[^<|\/>]+\/>/g) || [])
    .map((original) => {
      const def = original.slice(1, -2).trim();
      const tagName = def.split(' ')[0].trim();

      return { original, def, tagName };
    })
    .forEach(({ original, def, tagName }) => {
      let newTagContent = def;

      newTagContent = VOID_ELEMENTS.includes(tagName)
        ? `<${newTagContent.replace(/[\r|\n]/g, '')}>`
        : `<${newTagContent}></${tagName}>`;

      html = html.replace(original, newTagContent);
    });

  html = getOuterHTML(parseDOM(html));
  return html;
};
