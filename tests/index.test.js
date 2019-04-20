const { compileTemplate } = require('../src');

const wrapper = x => {
  return `<html>
    <body>
      ${x}
    </body>
  </html>`;
};

describe('Template compilation', () => {
  test('Zero compilation', () => {
    const input = wrapper('<h1>Test</h1>');

    const output = compileTemplate(input, { default: '' });

    expect(output).toBe(input);
  });

  test('Basic slot filling', () => {
    const content = 'Content';

    const input = wrapper('<sergey-slot />');
    const desiredOutput = wrapper(content);

    const output = compileTemplate(input, { default: content });

    expect(output).toBe(desiredOutput);
  });

  test('<sergey-slot/> tag', () => {
    const content = 'Content';

    const input = wrapper('<sergey-slot/>');
    const desiredOutput = wrapper(content);

    const output = compileTemplate(input, { default: content });

    expect(output).toBe(desiredOutput);
  });

  test('<sergey-slot></sergey-slot> tag', () => {
    const content = 'Content';

    const input = wrapper('<sergey-slot></sergey-slot>');
    const desiredOutput = wrapper(content);

    const output = compileTemplate(input, { default: content });

    expect(output).toBe(desiredOutput);
  });

  test('Basic slot with whitespace', () => {
    const content = 'Content\nNewline';

    const input = wrapper('<sergey-slot />');
    const desiredOutput = wrapper(content);

    const output = compileTemplate(input, { default: content });

    expect(output).toBe(desiredOutput);
  });

  test('Basic slot with HTML', () => {
    const content = '<p>Paragraph</p>';

    const input = wrapper('<sergey-slot />');
    const desiredOutput = wrapper(content);

    const output = compileTemplate(input, { default: content });

    expect(output).toBe(desiredOutput);
  });

  test('Default slot content', () => {
    const defaultContent = 'Default content';

    const input = wrapper(`<sergey-slot>${defaultContent}</sergey-slot>`);
    const desiredOutput = wrapper(defaultContent);

    const output = compileTemplate(input, { default: '' });

    expect(output).toBe(desiredOutput);
  });

  test('Named slot', () => {
    const namedContent = 'Named content';

    const input = wrapper(`<sergey-slot name="named" />`);
    const desiredOutput = wrapper(namedContent);

    const output = compileTemplate(input, { default: '', named: namedContent });

    expect(output).toBe(desiredOutput);
  });

  test('Named slot with spaceless tag', () => {
    const namedContent = 'Named content';

    const input = wrapper(`<sergey-slot name="named"/>`);
    const desiredOutput = wrapper(namedContent);

    const output = compileTemplate(input, { default: '', named: namedContent });

    expect(output).toBe(desiredOutput);
  });

  test('Named slot with full tag', () => {
    const namedContent = 'Named content';

    const input = wrapper(`<sergey-slot name="named"></sergey-slot>`);
    const desiredOutput = wrapper(namedContent);

    const output = compileTemplate(input, { default: '', named: namedContent });

    expect(output).toBe(desiredOutput);
  });

  test('Named slot with default content tag and named content', () => {
    const namedContent = 'Named content';

    const input = wrapper(
      `<sergey-slot name="named">Default content</sergey-slot>`
    );
    const desiredOutput = wrapper(namedContent);

    const output = compileTemplate(input, { default: '', named: namedContent });

    expect(output).toBe(desiredOutput);
  });

  test('Named slot with default content tag and named content', () => {
    const defaultContent = 'Default content';

    const input = wrapper(
      `<sergey-slot name="named">${defaultContent}</sergey-slot>`
    );
    const desiredOutput = wrapper(defaultContent);

    const output = compileTemplate(input, {
      default: '',
      named: ''
    });

    expect(output).toBe(desiredOutput);
  });
});
