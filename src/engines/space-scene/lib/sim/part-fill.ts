import { createUiLoader } from '../../../../i18n/ui-loader';

const fill = createUiLoader({ runtime: () => import('./part-fill-runtime') });
export const loadPartFill = () => fill.load('runtime');
export const readPartFill = () => fill.read('runtime');
