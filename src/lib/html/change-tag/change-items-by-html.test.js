const { getInnerHTML, getOuterHTML } = require('domutils');
const { changeItemsByHTML } = require('./index');

test('Change HTML tags', () => {
  const input =
    '<div><p class="inner-only">KEEP INNER ONLY</p><p class="attrb" data-foo="bar">attrb</p></div>';
  const expected =
    '<div>KEEP INNER ONLY<p class="attrb" data-foo="baz">attrb</p></div>';

  let output = input;
  output = changeItemsByHTML({
    html: output,
    selector: '.inner-only',
    changeItem: (node) => {
      return getInnerHTML(node);
    },
  });
  output = changeItemsByHTML({
    html: output,
    selector: '.attrb',
    changeItem: (node) => {
      node.attribs['data-foo'] = 'baz';
      return getOuterHTML(node);
    },
  });

  expect(output).toBe(expected);
});
