const { prepareHTML } = require('./index');

test('Prepare HTML for self-closing tags', () => {
  const input = '<div><sergey-slot /><img></div>';
  const expected = '<div><sergey-slot></sergey-slot><img></div>';
  const output = prepareHTML(input);

  expect(output).toBe(expected);
});


test('Prepare HTML for multiline tags', () => {
  const input = `<div
foo="bar"
>...</div>`;

  const expected = '<div foo="bar">...</div>';
  const output = prepareHTML(input);

  expect(output).toBe(expected);
});

