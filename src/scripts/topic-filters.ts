/**
 * Index page filters (subject, level). Plain DOM, no framework. State lives in
 * the query string (`?subject=science&level=P4`) so filtered lists are shareable.
 */
type FilterKey = 'subject' | 'level';

export function initTopicFilters(root: ParentNode = document): void {
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-filter]'));
  const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-topic]'));
  const count = root.querySelector<HTMLElement>('[data-count]');
  const empty = root.querySelector<HTMLElement>('[data-empty]');
  if (buttons.length === 0) return;

  const params = new URLSearchParams(window.location.search);
  const state: Record<FilterKey, string> = {
    subject: params.get('subject') ?? '',
    level: params.get('level') ?? '',
  };

  const apply = () => {
    let visible = 0;
    for (const card of cards) {
      const okSubject = !state.subject || card.dataset.subject === state.subject;
      const okLevel = !state.level || (card.dataset.levels ?? '').split(' ').includes(state.level);
      const show = okSubject && okLevel;
      card.hidden = !show;
      if (show) visible++;
    }
    for (const button of buttons) {
      const key = button.dataset.filter as FilterKey;
      button.setAttribute('aria-pressed', String((button.dataset.value ?? '') === state[key]));
    }
    if (count) count.textContent = (count.dataset.template ?? '{n}').replace('{n}', String(visible));
    if (empty) empty.hidden = visible > 0;
    if (empty) empty.classList.toggle('hidden', visible > 0);

    const next = new URLSearchParams(window.location.search);
    for (const key of ['subject', 'level'] as const) {
      if (state[key]) next.set(key, state[key]);
      else next.delete(key);
    }
    const qs = next.toString();
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`);
  };

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const key = button.dataset.filter as FilterKey;
      state[key] = button.dataset.value ?? '';
      apply();
    });
  }
  apply();
}
