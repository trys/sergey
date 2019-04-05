const fs = require('fs');
const pathModule = require('path');
const VERBOSE = true;

const cachedImports = {};

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

const simpleSlotsToContent = (body, content = '') => {
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
    replace = simpleSlotsToContent(replace, '');

    body = body.replace(find, replace);
  }

  const complexImport = /<lil-import href="(.*)">(.*)<\/lil-import>/gms;
  while ((m = complexImport.exec(body)) !== null) {
    if (m.index === complexImport.lastIndex) {
      complexImport.lastIndex++;
    }

    const [find, key, content] = m;
    let replace = cachedImports[key] || '';
    replace = simpleSlotsToContent(replace, content);

    body = body.replace(find, replace);
  }

  return body;
};

const compileFolder = async (folderPath, publicDirPath) => {
  if (publicDirPath) {
    await createFolder(pathModule.resolve(publicDirPath));
  }

  new Promise((resolve, reject) => {
    fs.readdir(folderPath, async (err, files) => {
      if (err) {
        return reject(`Folder: ${folderPath} doesn't exist`);
      }

      await Promise.all(
        files
          .filter(
            x =>
              !x.startsWith('.git') &&
              !x.startsWith('node_modules') &&
              !x.startsWith('src') &&
              !x.startsWith('_imports') &&
              !x.startsWith('public')
          )
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

            await fs.stat(fullPath, (err, stat) => {
              if (stat && stat.isDirectory()) {
                return compileFolder(
                  `${folderPath}${localFilePath}/`,
                  `${publicDirPath}${localFilePath}/`,
                  true
                );
              } else {
                return copyFile(fullPath, publicPath);
              }
            });
          })
      );
      return resolve();
    });
  });
};

(async () => {
  try {
    // TODO: clear public folder
    // TODO: check for _imports

    await prepareImports('./_imports/');
    await compileImports();
    await compileFolder('./', './public/');
  } catch (e) {
    console.log(e);
  }
})();
