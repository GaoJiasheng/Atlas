/** Verification bridge for the inherited extensionless Drei Html import and slow CPU geometry assertions. No tests are skipped. */
import {defineConfig,mergeConfig} from 'vitest/config';
import {realpathSync} from 'node:fs';
import base from '../../../vitest.config';
export default mergeConfig(base,defineConfig({
 server:{fs:{allow:[process.cwd(),realpathSync('node_modules') ,realpathSync('node_modules/.pnpm')]}},
 resolve:{alias:{'@react-three/drei/web/Html':realpathSync('node_modules/@react-three/drei/web/Html.js')}},
 test:{maxWorkers:2,testTimeout:30000},
}));
