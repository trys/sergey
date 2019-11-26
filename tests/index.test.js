const {
  compileTemplate,
  compileLinks,
  primeImport,
  IMPORTS,
  ACTIVE_CLASS
} = require('../src');

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

const testImport = file => `${IMPORTS}${file}`;

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

  test('Named slot with underscores', () => {
    const namedContent = 'Named content';

    const input = wrapper(`<sergey-slot name="named_slot" />`);
    const desiredOutput = wrapper(namedContent);

    const output = compileTemplate(input, { named_slot: namedContent });

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
    primeImport(testImport('header.html'), header());

    const desiredOutput = header();
    const output = compileTemplate('<sergey-import src="header" />');

    expect(output).toBe(desiredOutput);
  });

  test('Multiple imports', () => {
    primeImport(testImport('header.html'), header());
    primeImport(testImport('footer.html'), footer());

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
    primeImport(testImport('header.html'), header('<sergey-slot />'));
    const content = '<p>Content</p>';

    const desiredOutput = header(content);
    const output = compileTemplate(`<sergey-import src="header">
      ${content}
    </sergey-import>`);

    expect(output).toBe(desiredOutput);
  });

  test('A basic import with a default slot', () => {
    const content = '<p>Content</p>';
    primeImport(
      testImport('header.html'),
      header(`<sergey-slot>${content}</sergey-slot>`)
    );

    const desiredOutput = header(content);
    const output = compileTemplate(`<sergey-import src="header" />`);

    expect(output).toBe(desiredOutput);
  });

  test('A basic import with a named slot', () => {
    primeImport(
      testImport('header.html'),
      header(`<sergey-slot name="headerName" />`)
    );
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
      testImport('header.html'),
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
      testImport('header.html'),
      header(`<sergey-slot name="headerName">${defaultContent}</sergey-slot>`)
    );

    const desiredOutput = header(defaultContent);
    const output = compileTemplate(`<sergey-import src="header" />`);

    expect(output).toBe(desiredOutput);
  });
});

describe('Markdown compilation', () => {
  test('A heading', () => {
    primeImport(testImport('about.md'), '# About us');

    const desiredOutput = '<h1 id="about-us">About us</h1>';
    const output = compileTemplate(
      '<sergey-import src="about" as="markdown" />'
    );

    expect(output).toBe(desiredOutput);
  });

  test('Multiline markdown', () => {
    primeImport(
      testImport('about.md'),
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

  test('Multiline markdown with code block', () => {
    primeImport(
      testImport('code.md'),
      `<sergey-import src="snippet" as="markdown" />`
    );

    primeImport(
      testImport('snippet.md'),
      `# Example code block

\`\`\`html
<article>
  <sergey-import src="code" as="markdown" />
</article>
\`\`\`
`
    );
    const desiredOutput = `<h1 id="example-code-block">Example code block</h1>
<pre><code class="language-html">&lt;article&gt;
  &lt;sergey-import src=&quot;code&quot; as=&quot;markdown&quot; /&gt;
&lt;/article&gt;</code></pre>`;

    const output = compileTemplate(
      '<sergey-import src="code" as="markdown" />'
    );

    expect(output).toBe(desiredOutput);
  });
});

describe('Link compilation', () => {
  test('A link', () => {
    const input = `<sergey-link to="/example/">Example Link</sergey-link>`;
    const desiredOutput = `<a href="/example/">Example Link</a>`;
    const output = compileLinks(input);

    expect(output).toBe(desiredOutput);
  });

  test('Multiple links', () => {
    const input = `
      <sergey-link to="/example-1/">Example Link 1</sergey-link>
      <sergey-link to="/example-2/">Example Link 2</sergey-link>
      <sergey-link to="/example-3/">Example Link 3</sergey-link>
      `;
    const desiredOutput = `
      <a href="/example-1/">Example Link 1</a>
      <a href="/example-2/">Example Link 2</a>
      <a href="/example-3/">Example Link 3</a>
      `;
    const output = compileLinks(input);

    expect(output).toBe(desiredOutput);
  });

  test('A link to identical current path', () => {
    const input = `<sergey-link to="/example/index.html">Example</sergey-link>`;
    const path = '/example/index.html';

    const desiredOutput = `<a href="/example/index.html" class="${ACTIVE_CLASS}" aria-current="page">Example</a>`;
    const output = compileLinks(input, path);

    expect(output).toBe(desiredOutput);
  });

  test('A link to start of current path', () => {
    const input = `<sergey-link to="/example/">Example</sergey-link>`;
    const path = '/example/index.html';

    const desiredOutput = `<a href="/example/" class="${ACTIVE_CLASS}" aria-current="page">Example</a>`;
    const output = compileLinks(input, path);

    expect(output).toBe(desiredOutput);
  });

  test('A link to a parent path', () => {
    const input = `<sergey-link to="/example/">Example</sergey-link>`;
    const path = '/example/foo/index.html';

    const desiredOutput = `<a href="/example/" class="${ACTIVE_CLASS}">Example</a>`;
    const output = compileLinks(input, path);

    expect(output).toBe(desiredOutput);
  });

  test('Multiple links, with 1 current', () => {
    const path = '/example-1/';
    const input = `
      <sergey-link to="/example-1/">Example Link 1</sergey-link>
      <sergey-link to="/example-2/">Example Link 2</sergey-link>
      <sergey-link to="/example-3/">Example Link 3</sergey-link>
      `;
    const desiredOutput = `
      <a href="/example-1/" class="${ACTIVE_CLASS}" aria-current="page">Example Link 1</a>
      <a href="/example-2/">Example Link 2</a>
      <a href="/example-3/">Example Link 3</a>
      `;
    const output = compileLinks(input, path);

    expect(output).toBe(desiredOutput);
  });

  test('Multiple links, with 1 parent', () => {
    const path = '/example-1/foo/index.html';
    const input = `
      <sergey-link to="/example-1/">Example Link 1</sergey-link>
      <sergey-link to="/example-2/">Example Link 2</sergey-link>
      <sergey-link to="/example-3/">Example Link 3</sergey-link>
      `;
    const desiredOutput = `
      <a href="/example-1/" class="${ACTIVE_CLASS}">Example Link 1</a>
      <a href="/example-2/">Example Link 2</a>
      <a href="/example-3/">Example Link 3</a>
      `;
    const output = compileLinks(input, path);

    expect(output).toBe(desiredOutput);
  });

  test('Home link, current', () => {
    const path = '/index.html';
    const input = `
      <sergey-link to="/">Home</sergey-link>
      `;
    const desiredOutput = `
      <a href="/" class="${ACTIVE_CLASS}" aria-current="page">Home</a>
      `;
    const output = compileLinks(input, path);

    expect(output).toBe(desiredOutput);
  });

  test('Home link, not current', () => {
    const path = '/about/index.html';
    const input = `
      <sergey-link to="/">Home</sergey-link>
      `;
    const desiredOutput = `
      <a href="/" class="${ACTIVE_CLASS}">Home</a>
      `;
    const output = compileLinks(input, path);

    expect(output).toBe(desiredOutput);
  });

  test('Link to partial, not current', () => {
    const path = '/about/index.html';
    const input = `
      <sergey-link to="/#subscribe">Subscribe</sergey-link>
      `;
    const desiredOutput = `
      <a href="/#subscribe" class="${ACTIVE_CLASS}">Subscribe</a>
      `;
    const output = compileLinks(input, path);

    expect(output).toBe(desiredOutput);
  });

  test('Link with front-loaded classes', () => {
    const path = '/index.html';
    const input = `
      <sergey-link class="my-class" to="/">Home</sergey-link>
      `;
    const desiredOutput = `
      <a href="/" class="${ACTIVE_CLASS} my-class" aria-current="page">Home</a>
      `;
    const output = compileLinks(input, path);

    expect(output).toBe(desiredOutput);
  });

  test('Link with back-loaded classes', () => {
    const path = '/index.html';
    const input = `
      <sergey-link to="/" class="my-class">Home</sergey-link>
      `;
    const desiredOutput = `
      <a href="/" class="${ACTIVE_CLASS} my-class" aria-current="page">Home</a>
      `;
    const output = compileLinks(input, path);

    expect(output).toBe(desiredOutput);
  });

  test('Link with other attributes', () => {
    const path = '/index.html';
    const input = `
      <sergey-link to="/" id="an-id">Home</sergey-link>
      `;
    const desiredOutput = `
      <a href="/" id="an-id" class="${ACTIVE_CLASS}" aria-current="page">Home</a>
      `;
    const output = compileLinks(input, path);

    expect(output).toBe(desiredOutput);
  });

  test('Link with ids and classes', () => {
    const path = '/index.html';
    const input = `
      <sergey-link to="/" class="my-class" id="an-id">Home</sergey-link>
      `;
    const desiredOutput = `
      <a href="/" class="${ACTIVE_CLASS} my-class" id="an-id" aria-current="page">Home</a>
      `;
    const output = compileLinks(input, path);

    expect(output).toBe(desiredOutput);
  });

  test('Link with href, rather than to', () => {
    const input = `
      <sergey-link href="/example-1/">Example Link 1</sergey-link>
      `;
    const desiredOutput = `
      <a href="/example-1/">Example Link 1</a>
      `;
    const output = compileLinks(input);

    expect(output).toBe(desiredOutput);
  });
});
