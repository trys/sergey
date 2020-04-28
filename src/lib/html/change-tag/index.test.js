const { getInnerHTML, getOuterHTML } = require('domutils');
const changeTag = require('./index');

test('Change HTML tags', () => {
  const input =
    '<div><p class="inner-only">KEEP INNER ONLY</p><p class="attrb" data-foo="bar">attrb</p></div>';
  const expected =
    '<div>KEEP INNER ONLY<p class="attrb" data-foo="baz">attrb</p></div>';

  let output = input;
  output = changeTag.main({ html: output, selector: '.inner-only' }, (node) => {
    return getInnerHTML(node);
  });
  output = changeTag.main({ html: output, selector: '.attrb' }, (node) => {
    node.attribs['data-foo'] = 'baz';
    return getOuterHTML(node);
  });

  expect(output).toBe(expected);
});
