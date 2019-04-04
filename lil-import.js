const fs = require('fs');

const importCache = {};

const getImport = path => {
  return new Promise((resolve, reject) => {
    if (importCache[path]) {
      return resolve(importCache[path]);
    }

    fs.readFile(`_imports/${path}`, (err, toImport) => {
      if (err) {
        return reject();
      }

      const replace = toImport.toString();
      importCache[path] = replace;
      resolve(replace);
    });
  });
};

fs.readdir('./', (err, files) => {
  files
    .filter(x => x.endsWith('.html'))
    .forEach(originalPath => {
      fs.readFile(originalPath, async (err, file) => {
        let fileBody = file.toString();
        let updated = false;
        const basicImport = /<lil-import href="(.*)" \/>/gm;
        let m;

        while ((m = basicImport.exec(fileBody)) !== null) {
          if (m.index === basicImport.lastIndex) {
            basicImport.lastIndex++;
          }

          const [find, path] = m;
          const replace = await getImport(path);
          fileBody = fileBody.replace(find, replace);
          updated = true;
        }

        const complexImport = /<lil-import href="(.*)">(.*)<\/lil-import>/gms;

        while ((m = complexImport.exec(fileBody)) !== null) {
          if (m.index === complexImport.lastIndex) {
            complexImport.lastIndex++;
          }

          const [find, path, content] = m;
          let replace = await getImport(path);

          const slot = /<lil-slot \/>/gm;
          replace = replace.replace(slot, content);

          fileBody = fileBody.replace(find, replace);
          updated = true;
        }

        fs.writeFile(`public/${originalPath}`, fileBody, () => {
          console.log(`${updated ? 'Compiled' : 'Copied'} ${originalPath}`);
        });
      });
    });
});
