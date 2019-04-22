const { compileTemplate, primeImport } = require('../src');

const wrapper = (x = '') => `<html>
  <body>
    ${x}
  </body>
</html>`;

const header = (x = '') => `<header>
  <a href="/">Home</a>
  ${x}
</header>`;

const footer = () => `<footer>
  &copy; 2019
</footer>`;

describe('Slot compilation', () => {
  test('Zero compilation', () => {
    const input = wrapper('<h1>Test</h1>');

    const output = compileTemplate(input);

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

    const output = compileTemplate(input);

    expect(output).toBe(desiredOutput);
  });

  test('Named slot', () => {
    const namedContent = 'Named content';

    const input = wrapper(`<sergey-slot name="named" />`);
    const desiredOutput = wrapper(namedContent);

    const output = compileTemplate(input, { named: namedContent });

    expect(output).toBe(desiredOutput);
  });

  test('Named slot with spaceless tag', () => {
    const namedContent = 'Named content';

    const input = wrapper(`<sergey-slot name="named"/>`);
    const desiredOutput = wrapper(namedContent);

    const output = compileTemplate(input, { named: namedContent });

    expect(output).toBe(desiredOutput);
  });

  test('Named slot with full tag', () => {
    const namedContent = 'Named content';

    const input = wrapper(`<sergey-slot name="named"></sergey-slot>`);
    const desiredOutput = wrapper(namedContent);

    const output = compileTemplate(input, { named: namedContent });

    expect(output).toBe(desiredOutput);
  });

  test('Named slot with default content tag and named content', () => {
    const namedContent = 'Named content';

    const input = wrapper(
      `<sergey-slot name="named">Default content</sergey-slot>`
    );
    const desiredOutput = wrapper(namedContent);

    const output = compileTemplate(input, { named: namedContent });

    expect(output).toBe(desiredOutput);
  });

  test('Named slot with default content tag and named content', () => {
    const defaultContent = 'Default content';

    const input = wrapper(
      `<sergey-slot name="named">${defaultContent}</sergey-slot>`
    );
    const desiredOutput = wrapper(defaultContent);

    const output = compileTemplate(input, {
      named: ''
    });

    expect(output).toBe(desiredOutput);
  });
});

describe('Import compilation', () => {
  test('A basic import', () => {
    primeImport('header.html', header());

    const desiredOutput = header();
    const output = compileTemplate('<sergey-import src="header" />');

    expect(output).toBe(desiredOutput);
  });

  test('Multiple imports', () => {
    primeImport('header.html', header());
    primeImport('footer.html', footer());

    const content = '<p>Content</p>';

    const desiredOutput = `${header()}
      ${content}
    ${footer()}`;

    const output = compileTemplate(`<sergey-import src="header" />
      ${content}
    <sergey-import src="footer"/>`);

    expect(output).toBe(desiredOutput);
  });

  test('A basic import with a slot', () => {
    primeImport('header.html', header('<sergey-slot />'));
    const content = '<p>Content</p>';

    const desiredOutput = header(content);
    const output = compileTemplate(`<sergey-import src="header">
      ${content}
    </sergey-import>`);

    expect(output).toBe(desiredOutput);
  });

  test('A basic import with a default slot', () => {
    const content = '<p>Content</p>';
    primeImport('header.html', header(`<sergey-slot>${content}</sergey-slot>`));

    const desiredOutput = header(content);
    const output = compileTemplate(`<sergey-import src="header" />`);

    expect(output).toBe(desiredOutput);
  });

  test('A basic import with a named slot', () => {
    primeImport('header.html', header(`<sergey-slot name="headerName" />`));
    const content = '<h1>Header</h1>';

    const desiredOutput = header(content);
    const output = compileTemplate(`<sergey-import src="header">
      <sergey-template name="headerName">
        ${content}
      </sergey-template>
    </sergey-import>`);

    expect(output).toBe(desiredOutput);
  });

  test('Named and unnamed slots', () => {
    primeImport(
      'header.html',
      header(`<sergey-slot name="headerName" />
    <sergey-slot />`)
    );
    const content = '<h1>Header</h1>';

    const desiredOutput = header(`${content}
    ${content}`);
    const output = compileTemplate(`<sergey-import src="header">
      <sergey-template name="headerName">
        ${content}
      </sergey-template>
      ${content}
    </sergey-import>`);

    expect(output).toBe(desiredOutput);
  });

  test('Default named slots', () => {
    const defaultContent = '<h1>Header</h1>';
    primeImport(
      'header.html',
      header(`<sergey-slot name="headerName">${defaultContent}</sergey-slot>`)
    );

    const desiredOutput = header(defaultContent);
    const output = compileTemplate(`<sergey-import src="header" />`);

    expect(output).toBe(desiredOutput);
  });
});

describe('Markdown compilation', () => {
  test('A heading', () => {
    primeImport('about.md', '# About us');

    const desiredOutput = '<h1 id="about-us">About us</h1>';
    const output = compileTemplate(
      '<sergey-import src="about" as="markdown" />'
    );

    expect(output).toBe(desiredOutput);
  });

  test('Multiline markdown', () => {
    primeImport(
      'about.md',
      `# About us
Content is **great**.`
    );

    const desiredOutput = `<h1 id="about-us">About us</h1>
<p>Content is <strong>great</strong>.</p>`;

    const output = compileTemplate(
      '<sergey-import src="about" as="markdown" />'
    );

    expect(output).toBe(desiredOutput);
  });
});
