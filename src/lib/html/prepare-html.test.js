const { prepareHTML } = require('./index');

test('Prepare HTML for self-closing tags', () => {
  const input = '<div><sergey-slot /><img></div>';
  const expected = '<div><sergey-slot></sergey-slot><img></div>';
  const output = prepareHTML(input);

  expect(output).toBe(expected);
});
