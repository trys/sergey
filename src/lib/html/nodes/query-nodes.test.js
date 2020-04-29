const queryNodes = require('./query-nodes');
const getNodes = require('./get-nodes');

test('Get nodes from select query', () => {
  const input = '<div>first <div>second</div> first</div><div>third</div>';
  const nodes = getNodes({ html: input });
  const output = queryNodes({ nodes, selector: 'div' }).length;
  const expected = 3;

  expect(output).toBe(expected);
});
