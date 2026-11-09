import { expect, it } from 'vitest';
import * as core from '../../src/engines/core/engine-url-fields';
import { encodeSimParam, decodeSimParam } from '../../src/engines/space-scene/lib/sim/controls';
import { decodeOrbitTime, validOrbitTime } from '../../src/engines/space-scene/lib/sim/orbit-clock';

it('keeps engine and shared URL codecs as the same functions', () => {
  expect(core.encodeSimParam).toBe(encodeSimParam);
  expect(core.decodeSimParam).toBe(decodeSimParam);
  expect(core.decodeOrbitTime).toBe(decodeOrbitTime);
  expect(core.validOrbitTime).toBe(validOrbitTime);
});
