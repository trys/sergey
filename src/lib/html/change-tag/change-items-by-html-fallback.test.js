const prepareHTML = require('../prepare-html');
const { changeItemsByHTML, changeItemsByHTMLFallback } = require('./index');
const getOptions = (option, html_) =>
  Object.assign({}, option, { html: html_ });

const options = [
  {
    selector: 'get-title',
    changeItem: () => {
      return '...';
    },
  },
  {
    selector: 'get-text',
    changeItem: () => {
      return 'text';
    },
  },
];

const input = prepareHTML(
  '<div><p title="<get-title />"><get-text /></p></div>'
);

test('Shoud fail to match tag with changeItemsByHTML', () => {
  const expected = prepareHTML('<div><p title="<get-title/>">text</p></div>');

  let output = input;
  output = changeItemsByHTML(getOptions(options[0], output));
  output = changeItemsByHTML(getOptions(options[1], output));

  expect(output).toBe(expected);
});

test('Change HTML tags with changeItemsByHTMLFallback', () => {
  const expected = prepareHTML('<div><p title="...">text</p></div>');

  let output = input;

  // get-title
  output = changeItemsByHTML(getOptions(options[0], output));
  output = changeItemsByHTMLFallback(getOptions(options[0], output));
  // get-text
  output = changeItemsByHTML(getOptions(options[1], output));
  output = changeItemsByHTMLFallback(getOptions(options[1], output));

  expect(output).toBe(expected);
});
