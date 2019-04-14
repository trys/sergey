#!/usr/bin/env node
const fs = require('fs');
const { performance } = require('perf_hooks');

/**
 * Environment varibales
 */
const getEnv = key =>
  (process.argv.find(x => x.startsWith(key)) || '').replace(key, '');
const isWatching = process.argv.includes('--watch');

const ROOT = getEnv('--root=') || './';

const IMPORTS_LOCAL = getEnv('--imports=') || '_imports';
const IMPORTS = `${ROOT}${IMPORTS_LOCAL}/`;

const OUTPUT_LOCAL = getEnv('--output=') || 'public';
const OUTPUT = `${ROOT}${OUTPUT_LOCAL}/`;

const VERBOSE = false;
const cachedImports = {};
const excludedFolders = [
  '.git',
  '.DS_Store',
  'node_modules',
  'package.json',
  'package-lock.json',
  IMPORTS_LOCAL,
  OUTPUT_LOCAL
];

const patterns = {
  whitespace: /^\s+|\s+$/g,
  templates: /<sergey-template name="([a-z0-9-.]*)">(.*?)<\/sergey-template>/gms,
  complexNamedSlots: /<sergey-slot name="([a-z0-9-.]*)">(.*?)<\/sergey-slot>/gms,
  simpleNamedSlots: /<sergey-slot name="([a-z0-9-.]*)"\s?\/>/gm,
  complexDefaultSlots: /<sergey-slot>(.*?)<\/sergey-slot>/gms,
  simpleDefaultSlots: /<sergey-slot\s?\/>/gm,
  complexImports: /<sergey-import src="([a-z0-9-.]*)">(.*?)<\/sergey-import>/gms,
  simpleImports: /<sergey-import src="([a-z0-9-.]*)"\s?\/>/gm
};

/**
 * FS utils
 */
const copyFile = (src, dest) => {
  return new Promise((resolve, reject) => {
    fs.copyFile(src, dest, err => {
      if (err) {
        return reject(err);
      } else {
        VERBOSE && console.log(`Copied ${src}`);
        resolve();
      }
    });
  });
};

const createFolder = path => {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, data) => {
      if (err) {
        fs.mkdir(path, (err, data) => {
          return err ? reject(`Couldn't create folder: ${path}`) : resolve();
        });
      } else {
        return resolve();
      }
    });
  });
};

const readDir = path => {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, data) => (err ? reject(err) : resolve(data)));
  });
};

const readFile = path => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) =>
      err ? reject(err) : resolve(data.toString())
    );
  });
};

const writeFile = (path, body) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, body, err => {
      if (err) {
        return reject(err);
      }

      VERBOSE && console.log(`Saved ${path}`);
      return resolve();
    });
  });
};

const clearOutputFolder = async () => {
  const deleteFolder = path => {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach(function(file, index) {
        const newPath = path + '/' + file;
        if (fs.lstatSync(newPath).isDirectory()) {
          deleteFolder(newPath);
        } else {
          fs.unlinkSync(newPath);
        }
      });
      fs.rmdirSync(path);
    }
  };

  return deleteFolder(OUTPUT);
};

const getAllHTMLFiles = path => {
  const files = [];

  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index) {
      if (excludedFolders.find(x => file.startsWith(x))) {
        return;
      }

      const newPath = path + '/' + file;
      if (fs.lstatSync(newPath).isDirectory()) {
        files.push(...getAllHTMLFiles(newPath));
      } else {
        if (!file.endsWith('.html')) {
          return;
        }

        files.push(newPath);
      }
    });
  }

  return files;
};

const getFilesToWatch = path => {
  const files = [];
  const filesToIgnore = [...excludedFolders];
  const importIndex = filesToIgnore.indexOf(IMPORTS_LOCAL);
  if (importIndex !== -1) {
    filesToIgnore.splice(importIndex, 1);
  }

  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index) {
      if (filesToIgnore.find(x => file.startsWith(x))) {
        return;
      }

      const newPath = path + '/' + file;
      if (fs.lstatSync(newPath).isDirectory()) {
        files.push(...getFilesToWatch(newPath));
      } else {
        files.push(newPath);
      }
    });
  }

  return files;
};

/**
 * Helpers
 */
const formatContent = x => x.replace(patterns.whitespace, '');
const getKey = key => (key.endsWith('.html') ? key : `${key}.html`);
const hasImports = x => x.includes('<sergey-import');

/**
 * #business logic
 */
const prepareImports = async importsDir => {
  const fileNames = await readDir(importsDir);
  const bodies = await Promise.all(
    fileNames.map(localFileName => {
      return readFile(`${importsDir}${localFileName}`);
    })
  );

  fileNames.forEach((fileName, index) => {
    cachedImports[fileName] = bodies[index];
  });
};

const getSlots = content => {
  // Extract templates first
  const slots = {
    default: formatContent(content)
  };

  // Search content for templates
  while ((m = patterns.templates.exec(content)) !== null) {
    if (m.index === patterns.templates.lastIndex) {
      patterns.templates.lastIndex++;
    }

    const [find, name, data] = m;
    if (name !== 'default') {
      // Remove it from the default content
      slots.default = slots.default.replace(find, '');
    }

    // Add it as a named slot
    slots[name] = formatContent(data);
  }

  slots.default = formatContent(slots.default);

  return slots;
};

const compileSlots = (body, slots) => {
  let m;
  let copy;

  // Complex named slots
  copy = body;
  while ((m = patterns.complexNamedSlots.exec(body)) !== null) {
    if (m.index === patterns.complexNamedSlots.lastIndex) {
      patterns.complexNamedSlots.lastIndex++;
    }

    const [find, name, fallback] = m;
    copy = copy.replace(find, slots[name] || fallback || '');
  }
  body = copy;

  // Simple named slots
  while ((m = patterns.simpleNamedSlots.exec(body)) !== null) {
    if (m.index === patterns.simpleNamedSlots.lastIndex) {
      patterns.simpleNamedSlots.lastIndex++;
    }

    const [find, name] = m;
    copy = copy.replace(find, slots[name] || '');
  }
  body = copy;

  // Complex Default slots
  while ((m = patterns.complexDefaultSlots.exec(body)) !== null) {
    if (m.index === patterns.complexDefaultSlots.lastIndex) {
      patterns.complexDefaultSlots.lastIndex++;
    }

    const [find, fallback] = m;
    copy = copy.replace(find, slots.default || fallback || '');
  }
  body = copy;

  // Simple default slots
  body = body.replace(patterns.simpleDefaultSlots, slots.default);

  return body;
};

const compileTemplate = (body, slots) => {
  body = compileSlots(body, slots);

  if (!hasImports(body)) {
    return body;
  }

  // Simple imports
  while ((m = patterns.simpleImports.exec(body)) !== null) {
    if (m.index === patterns.simpleImports.lastIndex) {
      patterns.simpleImports.lastIndex++;
    }

    let [find, key] = m;
    let replace = cachedImports[getKey(key)] || '';
    const slots = getSlots('');

    // Recurse
    replace = compileTemplate(replace, slots);

    body = body.replace(find, replace);
  }

  // Complex imports
  while ((m = patterns.complexImports.exec(body)) !== null) {
    if (m.index === patterns.complexImports.lastIndex) {
      patterns.complexImports.lastIndex++;
    }

    let [find, key, content] = m;
    let replace = cachedImports[getKey(key)] || '';
    const slots = getSlots(content);

    // Recurse
    replace = compileTemplate(replace, slots);

    body = body.replace(find, replace);
  }

  return body;
};

const compileFile = body => {
  return compileTemplate(body, {
    default: ''
  });
};

const compileFolder = async (localFolder, localPublicFolder) => {
  const fullFolderPath = `${ROOT}${localFolder}`;
  const fullPublicPath = `${ROOT}${localPublicFolder}`;

  if (localPublicFolder) {
    await createFolder(fullPublicPath);
  }

  return new Promise((resolve, reject) => {
    fs.readdir(fullFolderPath, async (err, files) => {
      if (err) {
        return reject(`Folder: ${fullFolderPath} doesn't exist`);
      }

      Promise.all(
        files
          .filter(x => {
            return !excludedFolders.find(y => x.startsWith(y));
          })
          .map(async localFilePath => {
            const fullFilePath = `${fullFolderPath}${localFilePath}`;
            const fullPublicFilePath = `${fullPublicPath}${localFilePath}`;

            if (localFilePath.endsWith('.html')) {
              return readFile(fullFilePath)
                .then(compileFile)
                .then(body => writeFile(fullPublicFilePath, body));
            }

            return new Promise((resolve, reject) => {
              fs.stat(fullFilePath, async (err, stat) => {
                if (err) {
                  return reject(err);
                }

                if (stat && stat.isDirectory()) {
                  await compileFolder(
                    `${localFolder}${localFilePath}/`,
                    `${OUTPUT_LOCAL}/${localFolder}${localFilePath}/`
                  );
                } else {
                  await copyFile(fullFilePath, fullPublicFilePath);
                }
                return resolve();
              });
            });
          })
      )
        .then(resolve)
        .catch(reject);
    });
  });
};

const compileFiles = async () => {
  try {
    await readDir(IMPORTS);
  } catch (e) {
    console.error(`No ${IMPORTS} folder found`);
    return;
  }

  try {
    const start = performance.now();

    await clearOutputFolder();
    await prepareImports(IMPORTS);
    await compileFolder('', `${OUTPUT_LOCAL}/`);

    const end = performance.now();

    console.log(`Compiled in ${Math.ceil(end - start)}ms`);
  } catch (e) {
    console.log(e);
  }
};

/**
 * The entry point
 */
(async () => {
  if (!OUTPUT.startsWith('./')) {
    console.error('DANGER! Make sure you start the root with a ./');
    return;
  }

  if (!ROOT.endsWith('/')) {
    console.error('Make sure you end the root with a /');
    return;
  }

  await compileFiles();

  if (isWatching) {
    const chokidar = require('chokidar');
    const connect = require('connect');
    const serveStatic = require('serve-static');

    const watchRoot = ROOT.endsWith('/')
      ? ROOT.substring(0, ROOT.length - 1)
      : ROOT;
    const files = await getFilesToWatch(watchRoot);

    console.log(
      `Watching ${files.length} file${files.length !== 1 ? 's' : ''}`
    );

    chokidar.watch(files, {}).on('change', async path => {
      await compileFiles();
    });

    connect()
      .use(serveStatic(OUTPUT))
      .listen(8080, function() {
        console.log('Sergey running on http://localhost:8080');
      });
  }
})();
