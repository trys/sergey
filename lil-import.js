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

const compileFile = async (filePath, holdInMemory = false) => {
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
        fs.writeFile(`./public/${filePath}`, fileBody, () => {
          console.log(`${updated ? 'Compiled' : 'Copied'} ${filePath}`);
          return resolve();
        });
      }
    });
  });
};

const compileFolder = async (path, holdInMemory = false, recursive = false) => {
  if (!holdInMemory) {
    await checkForFolder(`./public/${path}`);
  }

  new Promise((resolve, reject) => {
    fs.readdir(path, async (err, files) => {
      if (err) {
        return reject(`Folder: ${path} doesn't exist`);
      }

      await Promise.all(
        files
          .filter(
            x =>
              !x.startsWith('.git') &&
              !x.startsWith('_imports') &&
              !x.startsWith('public')
          )
          .map(async x => {
            const fullPath = `${path}${x}`;

            if (x.endsWith('.html')) {
              return compileFile(fullPath, holdInMemory);
            }

            await fs.stat(fullPath, (err, stat) => {
              if (stat && stat.isDirectory()) {
                if (recursive) {
                  return compileFolder(`${fullPath}/`, false, true);
                }
              }
            });
          })
      );
      return resolve();
    });
  });
};

const checkForFolder = path => {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, data) => {
      if (err) {
        fs.mkdir(path, (err, data) => {
          return err ? reject(`Couldn't create public folder`) : resolve();
        });
      } else {
        return resolve();
      }
    });
  });
};

(async () => {
  try {
    await checkForFolder('./public/');
    await compileFolder('./_imports/', true);
    await compileFolder('./', false, true);
  } catch (e) {
    console.log(e);
  }
})();
