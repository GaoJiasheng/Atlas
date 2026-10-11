/**
 * Check a draft of lesson tasks before it goes into `lesson.json` (docs/15 §10,
 * skill atlas-lesson-topic): `pnpm tsx scripts/math/check-pool.ts <draft.json> [--bridge]`.
 * The draft is a JSON array of tasks (or `{ "pool": [...] }`). Every task is
 * parsed with the lesson schema, run through the content rules (`taskIssues`)
 * and proved (`proveTask`: solved by its solution, starts unsolved, every
 * wrong sample and wrong option diagnosed as declared). Prints one line per
 * problem and exits 1 when there is an error.
 */
import { readFileSync } from 'node:fs';
import { taskSchema } from '../../src/engines/math-scene/schema';
import { taskIssues } from '../../src/engines/math-scene/validate';
import { proveTask } from '../../src/engines/math-scene/lib/proof';

const file = process.argv[2];
if (!file) {
  console.error('usage: pnpm tsx scripts/math/check-pool.ts <draft.json> [--bridge]');
  process.exit(2);
}
const bridge = process.argv.includes('--bridge');
const raw: unknown = JSON.parse(readFileSync(file, 'utf8'));
const list = Array.isArray(raw) ? raw : (raw as { pool?: unknown[] }).pool;
if (!Array.isArray(list)) {
  console.error(`${file}: expected an array of tasks or { "pool": [...] }`);
  process.exit(2);
}
let errors = 0;
const ids = new Set<string>();
list.forEach((item, i) => {
  const parsed = taskSchema.safeParse(item);
  const name = (item as { id?: string }).id ?? `#${i + 1}`;
  if (!parsed.success) {
    errors++;
    for (const issue of parsed.error.issues) console.log(`ERROR ${name}: schema ${issue.path.join('.')}: ${issue.message}`);
    return;
  }
  const task = parsed.data;
  if (ids.has(task.id)) {
    errors++;
    console.log(`ERROR ${name}: id used twice`);
  }
  ids.add(task.id);
  for (const issue of taskIssues(task, name, { bridge, practice: false })) {
    if (issue.level === 'error') errors++;
    console.log(`${issue.level.toUpperCase()} ${issue.message}`);
  }
  for (const problem of proveTask(task)) {
    errors++;
    console.log(`ERROR ${name}: ${problem}`);
  }
});
console.log(`${list.length} task(s), ${errors} error(s)`);
process.exit(errors > 0 ? 1 : 0);
