## Why you might need links

Let's take an example of a navigation template you might use on a site:

```html
<nav>
  <a href="/">Home</a>
  <a href="/about/">About</a>
  <a href="/contact/">Contact</a>
</nav>
```

If this template is saved as `_imports/navigation.html`, you can reuse the navigation on any page like so:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Our lil' website</title>
  </head>
  <body>
    <header>
      <sergey-import src="navigation" />
    </header>
    <main>
      <h1>Welcome!</h1>
      <p>Our page content.</p>
    </main>
  </body>
</html>
```

So far, so good! However, on each page, we'd like this template to render a little differently. For example, on the homepage the navigation would render like so:

```html
<nav>
  <a href="/" class="active" aria-current="page">Home</a>
  <a href="/about/">About</a>
  <a href="/contact/">Contact</a>
</nav>
```

Whereas on the about page, it should render like this:

```html
<nav>
  <a href="/">Home</a>
  <a href="/about/" class="active" aria-current="page">About</a>
  <a href="/contact/">Contact</a>
</nav>
```

That's where `<sergey-link>` comes in!

#### Change navigation links to `<sergey-link>`

In the sample above, we can change our navigation template (`_imports/navigation.html`) to the following:

```html
<nav>
  <sergey-link to="/">Home</sergey-link>
  <sergey-link to="/about/">About</sergey-link>
  <sergey-link to="/contact/">Contact</sergey-link>
</nav>
```

Now when Sergey builds our site, it will add `class="active"` and `aria-current="page"` as appropriate on each page!

#### Pass attributes through `<sergey-link>`

Any HTML attributes we pass to a `<sergey-link>` will be passed through to the generated `<a>` tag. Sergey will also combine any classes you've set with the active class:

```html
<sergey-link to="/" class="my-class" id="an-id">Home</sergey-link>
```

The above will be converted into:

```html
<a href="/" class="active my-class" id="an-id" aria-current="page">Home</a>
```
