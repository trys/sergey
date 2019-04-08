const fs = require('fs');
const pathModule = require('path');
const chokidar = require('chokidar');
const { performance } = require('perf_hooks');

const VERBOSE = true;
const cachedImports = {};
const excludedFolders = ['.git', 'node_modules', 'src', '_imports', 'public'];

/**
 * Utils
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

const clearPublicFolder = async () => {
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

  return deleteFolder('./public/');
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

/**
 * Real code
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

const compileImports = async () => {
  const keys = Object.keys(cachedImports);
  keys.forEach(key => {
    cachedImports[key] = compileBody(cachedImports[key]);
  });
};

const compileSlots = (body, content = '') => {
  let m;
  const complexSlot = /<lil-slot>(.*)<\/lil-slot>/gms;
  while ((m = complexSlot.exec(body)) !== null) {
    if (m.index === complexSlot.lastIndex) {
      complexSlot.lastIndex++;
    }

    const [find, fallback] = m;
    body = body.replace(find, content || fallback || '');
  }

  body = body.replace(/<lil-slot \/>/gm, content);
  return body;
};

const compileBody = body => {
  const basicImport = /<lil-import href="(.*)" \/>/gm;
  while ((m = basicImport.exec(body)) !== null) {
    if (m.index === basicImport.lastIndex) {
      basicImport.lastIndex++;
    }

    const [find, key] = m;
    let replace = cachedImports[key] || '';

    // Remove empty slots
    replace = compileSlots(replace, '');

    body = body.replace(find, replace);
  }

  const complexImport = /<lil-import href="(.*)">(.*)<\/lil-import>/gms;
  while ((m = complexImport.exec(body)) !== null) {
    if (m.index === complexImport.lastIndex) {
      complexImport.lastIndex++;
    }

    const [find, key, content] = m;
    let replace = cachedImports[key] || '';
    replace = compileSlots(replace, content);

    body = body.replace(find, replace);
  }

  return body;
};

const compileFolder = async (folderPath, publicDirPath) => {
  if (publicDirPath) {
    await createFolder(pathModule.resolve(publicDirPath));
  }

  return new Promise((resolve, reject) => {
    fs.readdir(folderPath, async (err, files) => {
      if (err) {
        return reject(`Folder: ${folderPath} doesn't exist`);
      }

      Promise.all(
        files
          .filter(x => {
            return !excludedFolders.find(y => x.startsWith(y));
          })
          .map(async localFilePath => {
            let fullPath = pathModule.resolve(folderPath, localFilePath);
            const publicPath = pathModule.resolve(
              `./public/`,
              folderPath,
              localFilePath
            );

            if (localFilePath.endsWith('.html')) {
              return readFile(fullPath)
                .then(body => {
                  return compileBody(body);
                })
                .then(body => {
                  return writeFile(publicPath, body);
                });
            }

            return new Promise((resolve, reject) => {
              fs.stat(fullPath, async (err, stat) => {
                if (err) {
                  return reject(err);
                }

                if (stat && stat.isDirectory()) {
                  await compileFolder(
                    `${folderPath}${localFilePath}/`,
                    `${publicDirPath}${localFilePath}/`,
                    true
                  );
                } else {
                  await copyFile(fullPath, publicPath);
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
    await readDir('./_imports/');
  } catch (e) {
    console.error('No ./_imports/ folder found');
    return;
  }

  try {
    const start = performance.now();

    await clearPublicFolder();
    await prepareImports('./_imports/');
    await compileImports();
    await compileFolder('./', './public/');

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
  await compileFiles();

  if (process.argv.includes('--lil-watch')) {
    const files = await getAllHTMLFiles('.');
    console.log(
      `Watching ${files.length} file${files.length !== 1 ? 's' : ''}`
    );

    chokidar.watch(files, {}).on('change', compileFiles);
  }
})();
