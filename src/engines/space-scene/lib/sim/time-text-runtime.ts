/** Time-formatted simulation readings reuse the site's existing notation and speech. */
import { plainText, speakable } from '../../../../lib/rich-text';

// Keep a real lazy resource boundary: a re-export-only module can be merged
// back into its importer by Rollup's dynamic-entry optimization.
export const timeTextRuntime = { plainText, speakable };
