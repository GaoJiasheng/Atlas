import { createUiLoader } from '../../../../i18n/ui-loader';

const words = createUiLoader({ runtime: () => import('./time-text-runtime').then(m => m.timeTextRuntime) });
export const loadTimeText = () => words.load('runtime');
export const readTimeText = () => words.read('runtime');
