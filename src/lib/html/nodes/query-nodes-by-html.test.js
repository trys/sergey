const queryNodesByHTML = require('./query-nodes-by-html');

test('Get nodes from select query by using HTML', () => {
  const input = '<div>first <div>second</div> first</div><div>third</div>';
  const output = queryNodesByHTML({ html: input, selector: 'div' }).nodes.length;
  const expected = 3;

  expect(output).toBe(expected);
});
