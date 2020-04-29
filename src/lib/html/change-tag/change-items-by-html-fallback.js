const changeItemsByHTML = require('./change-items-by-html');

/**
 * bug-fix for tags inside tags (e.g. <meta foo="<sergey-slot></sergey-slot>">)
 * Extends `changeItemsByHTML`.
 * Can match tags inside tags 
 * @author Gabriel Rodrigues <jipacoding@gmail.com>
 */
module.exports = (options) => {
  let { html, selector } = options;

  if (html.includes(`</${selector}>`)) {
    const regexpRangeTag = selector.replace('-', '\\-');
    const remaingTags =
      html.match(
        new RegExp(
          `<${selector}[^<]*>[^<${regexpRangeTag}]*<\\/${selector}>`,
          'g'
        )
      ) || [];

    const foundAs = remaingTags.join('');
    html = html.replace(
      foundAs,
      changeItemsByHTML(Object.assign({}, options, { html: foundAs }))
    );
  }
  return html;
};
