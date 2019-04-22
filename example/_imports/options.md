## Command options

All of these options can be passed into the default `sergey` command.

#### `--watch`

This runs Sergey in dev mode, and opens up a server at `http://localhost:8080`. Any changes you make to local files will trigger a recompile and be ready for you on page refresh.

Top tip: set the **start** command to run `sergey`, and **dev** to run `sergey --watch`. Then you can run `npm start` and `npm run dev` respectively.

#### `--root=./subfolder/`

By default, Sergey runs in the same directory as your `package.json` file. You can override that with this command. Be sure to start it with a dot, and end it with a slash.

#### `--output=dist`

A `public` folder will be created to hold all the built files, unless you specify otherwise with this option.

#### `--imports=partials`

Sergey uses an `_imports` folder by default, but this argument lets you change that.

#### `--content=markdown`

Markdown files should be stored in a `_imports` folder, but you can override that.
