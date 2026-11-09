import { createUiLoader } from '../../../../i18n/ui-loader';

const tools = createUiLoader({ runtime: () => import('./sim-tools-runtime').then(m => m.simToolsRuntime) });
export const loadSimTools = () => tools.load('runtime');
export const readSimTools = () => tools.read('runtime');
