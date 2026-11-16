/** Runs every generator text stage in this one process (loaded with tsx and
 * generator-text-capture.mjs), so the suite pays one Node + tsx start-up and
 * shares parsed modules instead of spawning a child per topic.
 *
 * argv: a JSON array of { topic, path, target, args }. Each generator is
 * imported as if it were the entry script (process.argv[1] = its path), with
 * ATLAS_TEXT_TARGET set to its parts.json. Its stdout is buffered per topic and
 * process.exit() ends only that generator. The result, one
 * { topic, output, error? } per job, is written as JSON to stdout at the end. */
import { pathToFileURL } from 'node:url';

const jobs = JSON.parse(process.argv[2]);
const write = process.stdout.write.bind(process.stdout);
const exit = process.exit;
const [node] = process.argv;
class GeneratorExit extends Error {}
let buffer = '';
process.stdout.write = (chunk, ...rest) => {
  buffer += String(chunk);
  const callback = rest.at(-1);
  if (typeof callback === 'function') queueMicrotask(() => callback());
  return true;
};
process.exit = code => { throw new GeneratorExit(String(code ?? 0)); };

const results = [];
for (const { topic, path, target, args } of jobs) {
  buffer = '';
  process.env.ATLAS_TEXT_TARGET = target;
  process.argv = [node, path, ...args];
  let error;
  try {
    await import(pathToFileURL(path).href);
  } catch (caught) {
    if (!(caught instanceof GeneratorExit && caught.message === '0')) error = String(caught?.stack ?? caught);
  }
  results.push({ topic, output: buffer, ...(error ? { error } : {}) });
}
write(`${JSON.stringify(results)}\n`, () => exit(0));
