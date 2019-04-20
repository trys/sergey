#### Create a `_content` folder

Here's where your markdown files are going to live. You can change this directory with the `--content` argument, as [detailed here](/options/).

#### Create a markdown file

Write away to your hearts content, and save it as something like `about.md`

#### Import the markdown into your HTML page

Sergey re-uses the `<sergey-import>` tag with an `as="markdown"` attribute to denote the markdown format:

```html
<sergey-import src="about" as="markdown" />
```
