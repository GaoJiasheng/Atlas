#!/bin/zsh
# Run unchanged package scripts in an isolated writable snapshot. The worktree's
# node_modules symlink targets a sibling repository, where sandbox writes fail.
set -eu
TASK_ROOT="${0:A:h:h:h:h}"
TASK_GATE=/private/tmp/atlas-cfm-gates
mkdir -p "$TASK_GATE"
rsync -a --delete --exclude .git --exclude node_modules --exclude dist --exclude .astro --exclude 'scripts/geo/*/refs' "$TASK_ROOT/" "$TASK_GATE/"
mkdir -p "$TASK_GATE/node_modules"
for task_pkg in "$TASK_ROOT"/node_modules/*(D); do
 task_name="${task_pkg:t}"
 if [[ "$task_name" != .vite && "$task_name" != .vite-temp && "$task_name" != .cache ]]; then
  ln -sfn "${task_pkg:A}" "$TASK_GATE/node_modules/$task_name"
 fi
done
cd "$TASK_GATE"
task_gates=(check validate test build)
if [[ "${1:-all}" == remaining ]]; then task_gates=(test build); fi
for task_gate in "${task_gates[@]}"; do
 echo "Running pnpm $task_gate in $TASK_GATE"
 task_args=()
 if [[ "$task_gate" == test ]]; then task_args=(--maxWorkers=2); fi
 if pnpm run "$task_gate" "${task_args[@]}" >"/private/tmp/atlas-cfm-$task_gate-final.log" 2>&1; then
  echo "$task_gate PASS"
 else
  tail -60 "/private/tmp/atlas-cfm-$task_gate-final.log"
  exit 1
 fi
done
