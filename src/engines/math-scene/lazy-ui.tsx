/** Check/practice UI is requested only when that part of the lesson is shown. */
import { lazy, Suspense, type ComponentProps } from 'react';
const TrayView = lazy(() => import('./tray/Tray').then((m) => ({ default: m.Tray })));
const NetToolsView = lazy(() => import('./tray/NetControls').then((m) => ({ default: m.NetTools })));
const SummaryView = lazy(() => import('./practice/Summary').then((m) => ({ default: m.PracticeSummary })));

export function Tray(props: ComponentProps<typeof TrayView>) {
  return <Suspense fallback={null}><TrayView {...props} /></Suspense>;
}
export function NetTools(props: ComponentProps<typeof NetToolsView>) {
  return <Suspense fallback={null}><NetToolsView {...props} /></Suspense>;
}
export function PracticeSummary(props: ComponentProps<typeof SummaryView>) {
  return <Suspense fallback={null}><SummaryView {...props} /></Suspense>;
}
