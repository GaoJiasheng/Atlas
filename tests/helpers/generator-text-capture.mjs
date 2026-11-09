/** Child-process preload for editorial regression tests. All generator writes
 * are intercepted; only the target parts.json's bilingual text goes to stdout.
 * This also prevents model exporters from replacing accepted GLBs during tests. */
import fs from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

function textFields(value, path = '') {
  if (!value || typeof value !== 'object') return {};
  if (typeof value.en === 'string' && typeof value.zh === 'string') return { [path]: value };
  return Object.assign({}, ...Object.entries(value).map(([key, child]) => textFields(child,
    Array.isArray(value) ? `${path}[${child?.id ?? key}]` : `${path}.${key}`)));
}
function capture(path, data) {
  const name = resolve(path instanceof URL ? fileURLToPath(path) : String(path));
  if (name === process.env.ATLAS_TEXT_TARGET) {
    process.stdout.write(`ATLAS_TEXT_STAGE ${JSON.stringify(textFields(JSON.parse(String(data))))}\n`);
  }
}
fs.writeFileSync = capture;
fs.writeFile = (path, data, ...args) => {
  capture(path, data);
  const callback = args.at(-1);
  if (typeof callback === 'function') callback(null);
};
fs.promises.writeFile = async (path, data) => capture(path, data);
fs.mkdirSync = () => undefined;
fs.mkdir = (...args) => { const callback = args.at(-1); if (typeof callback === 'function') callback(null); };
fs.promises.mkdir = async () => undefined;
// No other filesystem mutation is needed by these text stages.
for (const method of ['appendFile', 'copyFile', 'rename', 'rm', 'rmdir', 'unlink', 'truncate']) {
  const deny = () => { throw new Error(`Unexpected generator filesystem mutation: ${method}`); };
  fs[method] = deny;
  fs[`${method}Sync`] = deny;
  fs.promises[method] = deny;
}
fs.createWriteStream = () => { throw new Error('Unexpected generator write stream'); };
syncBuiltinESMExports();
