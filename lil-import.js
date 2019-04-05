const fs = require('fs');
const pathModule = require('path');

const importCache = {};

const getImport = path => {
  return new Promise((resolve, reject) => {
    if (importCache[path]) {
      return resolve(importCache[path]);
    }

    fs.readFile(path, (err, toImport) => {
      if (err) {
        return reject(err);
      }

      const replace = toImport.toString();
      importCache[path] = replace;
      return resolve(replace);
    });
  });
};

const importPath = path => {
  return `./_imports/${path}`;
};

const compileFile = async (filePath, publicPath, holdInMemory = false) => {
  // ADD FOLDER PATH IN
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, async (err, file) => {
      if (err) {
        return reject(`File ${filePath} doesn't exist`);
      }

      let fileBody = file.toString();
      let updated = false;
      let m;

      try {
        const basicImport = /<lil-import href="(.*)" \/>/gm;
        while ((m = basicImport.exec(fileBody)) !== null) {
          if (m.index === basicImport.lastIndex) {
            basicImport.lastIndex++;
          }

          const [find, path] = m;
          const replace = await getImport(importPath(path));
          fileBody = fileBody.replace(find, replace);
          updated = true;
        }

        if (holdInMemory) {
          importCache[filePath] = fileBody;
        }

        const complexImport = /<lil-import href="(.*)">(.*)<\/lil-import>/gms;
        while ((m = complexImport.exec(fileBody)) !== null) {
          if (m.index === complexImport.lastIndex) {
            complexImport.lastIndex++;
          }

          const [find, path, content] = m;
          let replace = await getImport(importPath(path));

          const slot = /<lil-slot \/>/gm;
          replace = replace.replace(slot, content);

          fileBody = fileBody.replace(find, replace);
          updated = true;
        }
      } catch (e) {
        return reject();
      }

      if (!holdInMemory) {
        fs.writeFile(publicPath, fileBody, () => {
          console.log(`${updated ? 'Compiled' : 'Copied'} ${publicPath}`);
          return resolve();
        });
      }
    });
  });
};

const compileFolder = async (folderPath, publicDirPath, recursive = false) => {
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
              return compileFile(fullPath, publicPath, !publicDirPath);
            }

            await fs.stat(fullPath, (err, stat) => {
              if (stat && stat.isDirectory()) {
                if (recursive) {
                  return compileFolder(
                    `${folderPath}${localFilePath}/`,
                    `${publicDirPath}${localFilePath}/`,
                    true
                  );
                }
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

const copyFile = (src, dest) => {
  return new Promise((resolve, reject) => {
    fs.copyFile(src, dest, err => {
      if (err) {
        return reject(err);
      } else {
        console.log(`Copied ${src}`);
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

(async () => {
  try {
    // clear public folder
    // check for _imports

    await compileFolder('./_imports/', '');
    await compileFolder('./', './public/', true);
  } catch (e) {
    console.log(e);
  }
})();
