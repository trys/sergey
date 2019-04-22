#### Create a markdown file

Write away to your hearts content, and save it in your `_imports` folder as something like `about.md`

#### Import the markdown into your HTML page

Sergey re-uses the `<sergey-import>` tag with an `as="markdown"` attribute to denote the markdown format:

```html
<sergey-import src="about" as="markdown" />
```
