/**
 * Check a draft of lesson tasks before it goes into `lesson.json` (docs/15 §10,
 * skill atlas-lesson-topic; every task kind and answer form, docs/06 MathScene):
 *   pnpm tsx scripts/math/check-pool.ts <draft.json> [--bridge] [--topic <slug> --step <step-id>] [--limits '{"maxSide":12}' | '{"factors":[2,5],"maxTotal":40}' | '{"step":5,"maxDuration":"180m"}']
 * The draft is a JSON array of tasks (or `{ "pool": [...] }`). Every task is
 * parsed with the lesson schema, run through the content rules (`taskIssues`,
 * with the step's number limits: `--topic` + `--step` read them from that
 * topic's lesson.json, `--limits` gives them inline) and proved (`proveTask`:
 * solved by its solution, starts unsolved, every wrong sample and wrong option
 * diagnosed as declared). Prints one line per problem and exits 1 when there
 * is an error.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { lessonFile, stepLimits, taskSchema, type StepLimits } from '../../src/engines/math-scene/schema';
import { taskIssues } from '../../src/engines/math-scene/validate';
import { proveTask } from '../../src/engines/math-scene/lib/proof';

const { values: opts, positionals } = parseArgs({
  allowPositionals: true,
  options: { bridge: { type: 'boolean', default: false }, topic: { type: 'string' }, step: { type: 'string' }, limits: { type: 'string' } },
});
const file = positionals[0];
if (!file) {
  console.error('usage: pnpm tsx scripts/math/check-pool.ts <draft.json> [--bridge] [--topic <slug> --step <step-id>] [--limits <json>]');
  process.exit(2);
}
let bridge = opts.bridge ?? false;
// Inline limits go through the schema (durations like "180m" parse to seconds).
let limits: StepLimits | undefined = opts.limits ? stepLimits.parse(JSON.parse(opts.limits)) : undefined;
if (opts.topic) {
  const lesson = lessonFile.parse(JSON.parse(readFileSync(join(import.meta.dirname, '../../src/content/topics', opts.topic, 'data/lesson.json'), 'utf8')));
  const step = lesson.steps.find((s) => s.id === opts.step);
  if (!step) {
    console.error(`${opts.topic}: no step "${opts.step}" (steps: ${lesson.steps.map((s) => s.id).join(', ')})`);
    process.exit(2);
  }
  limits = { ...step.limits, ...limits };
  bridge = bridge || !!step.bridge;
  console.log(`limits of ${opts.topic} / ${step.id}: ${JSON.stringify(limits)}${bridge ? ' (going further)' : ''}`);
}
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
  for (const issue of taskIssues(task, name, { bridge, practice: false, limits })) {
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
