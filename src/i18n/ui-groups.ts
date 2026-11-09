export type UiGroup = 'common' | 'space' | 'time' | 'math' | 'index';

export function uiGroup(key: string): UiGroup {
  if (key.startsWith('index.')) return 'index';
  if (key.startsWith('space.') || key.startsWith('anatomy.')) return 'space';
  if (key.startsWith('time.')) return 'time';
  if (key.startsWith('math.')) return 'math';
  return 'common';
}

export function uiWords(dictionary: Record<string, string>, group: UiGroup): Record<string, string> {
  return Object.fromEntries(Object.entries(dictionary).filter(([key]) => uiGroup(key) === group));
}
