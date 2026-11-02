import { lazy, Suspense } from 'react';
import type { PartsFile } from '../schema';
const Notes = lazy(() => import('./SensesNotesContent').then(m => ({ default: m.SensesNotes })));
export function SensesNotes({ file }: { file: PartsFile }) {
  return file.sim?.senses ? <Suspense fallback={null}><Notes file={file} /></Suspense> : null;
}
