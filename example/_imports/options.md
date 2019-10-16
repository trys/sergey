## Options

These options can be passed into the default `sergey` command or as entries in your `.env` file.

---

**Arg:** `--watch`

This runs Sergey in dev mode, and opens up a server at `http://localhost:8080`. Any changes you make to local files will trigger a recompile and be ready for you on page refresh.

Top tip: set the **start** command to run `sergey`, and **dev** to run `sergey --watch`. Then you can run `npm start` and `npm run dev` respectively.

---

**Arg:** `--root=`  
**Env:** `SERGEY_ROOT`

By default, Sergey runs in the same directory as your `package.json` file. You can override that with this command. Be sure to start it with a dot, and end it with a slash.

---

**Arg:** `--output=`  
**Env:** `SERGEY_OUTPUT`

A `public` folder will be created to hold all the built files, unless you specify otherwise with this option.

---

**Arg:** `--imports=`  
**Env:** `SERGEY_IMPORTS`

Sergey uses an `_imports` folder by default, but this argument lets you change that.

---

**Arg:** `--content=`  
**Env:** `SERGEY_CONTENT`

Markdown files should be stored in a `_imports` folder, but you can override that.

---

**Arg:** `--exclude=`  
**Env:** `SERGEY_EXCLUDE`

When in dev mode, Sergey watches for file changes, but ignores common folders like `node_modules`. It also ignores everything in your `.gitignore` file. You can add to that list with this argument, in a comma-separated format.

---

**Arg:** `--port=`  
**Env:** `SERGEY_PORT`

Override the default port of 8080 with this option.
