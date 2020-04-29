const { getNodes } = require('./index');
const { getOuterHTML } = require('domutils');

test('Return HTML (XML) nodes', () => {
  const input = '<div>first</div><p>second</p>';
  const output = getNodes({ html: input }).length;
  const expected = 2;

  expect(output).toBe(expected);
});

test('Return HTML (XML) nodes', () => {
  const input = '<div>first</div><p>second</p>';
  const output = getOuterHTML(getNodes({ html: input }));
  const expected = input;

  expect(output).toBe(expected);
});
