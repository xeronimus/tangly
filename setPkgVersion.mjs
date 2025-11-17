import path from 'path';
import fs from 'fs-extra';
import {fileURLToPath} from 'url';

/**
 * Sets the specified version in our three package.json files
 *
 * invoke via command-line:    $ node setPkgVersion.mjs 0.4.3
 *
 */

const modules = ['./', './tangly-cli', './tangly-viewer'];
const dirname = path.dirname(fileURLToPath(import.meta.url));

if (process.argv.length < 3) {
  console.error('Current versions in package.json files:');
  Promise.all(modules.map(getPkgVersion))
    .then((v) => console.log(v.join('\n')))
    .finally(() => process.exit(1));

  async function getPkgVersion(module) {
    const absolutePkgJsonPath = path.resolve(dirname, path.join(module, 'package.json'));
    const pkgContent = await fs.readJson(absolutePkgJsonPath, 'utf-8');
    return `${absolutePkgJsonPath} - ${pkgContent.version}`;
  }
} else {
  const versionToSet = process.argv[2];
  Promise.all(modules.map(setPkgVersionInModule)).then(() => console.log('done'));

  async function setPkgVersionInModule(module) {
    const absolutePkgJsonPath = path.resolve(dirname, path.join(module, 'package.json'));

    const pkgContent = await fs.readJson(absolutePkgJsonPath, 'utf-8');
    console.log(`setting Version in ${absolutePkgJsonPath} to ${versionToSet}  (was ${pkgContent.version})`);

    pkgContent.version = versionToSet;
    await fs.writeJson(absolutePkgJsonPath, pkgContent, {spaces: 2});
  }
}
