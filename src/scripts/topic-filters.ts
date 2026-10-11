/**
 * Index page filters (subject). Plain DOM, no framework. State lives in
 * the query string (`?subject=science`) so filtered lists are shareable.
 * In the sectioned catalogue (`[data-section]` per subject) a section with no
 * visible plate hides too, and picking a subject scrolls its section into view.
 * The closing "more plates in preparation" card only shows unfiltered.
 */
type FilterKey = 'subject';

export function initTopicFilters(root: ParentNode = document): void {
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-filter]'));
  const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-topic]'));
  const count = root.querySelector<HTMLElement>('[data-count]');
  const empty = root.querySelector<HTMLElement>('[data-empty]');
  const sections = Array.from(root.querySelectorAll<HTMLElement>('[data-section]'));
  const closing = root.querySelector<HTMLElement>('[data-catalogue-end]');
  if (buttons.length === 0) return;

  const params = new URLSearchParams(window.location.search);
  const state: Record<FilterKey, string> = {
    subject: params.get('subject') ?? '',
  };

  const apply = () => {
    let visible = 0;
    for (const card of cards) {
      const okSubject = !state.subject || card.dataset.subject === state.subject;
      const show = okSubject;
      card.hidden = !show;
      if (show) visible++;
    }
    for (const button of buttons) {
      const key = button.dataset.filter as FilterKey;
      button.setAttribute('aria-pressed', String((button.dataset.value ?? '') === state[key]));
    }
    if (count) {
      const template = visible === 1 ? count.dataset.templateOne : count.dataset.template;
      count.textContent = (template ?? '{n}').replace('{n}', String(visible));
    }
    for (const section of sections) {
      section.hidden = !section.querySelector('[data-topic]:not([hidden])');
    }
    if (closing) closing.hidden = state.subject !== '';
    if (empty) empty.hidden = visible > 0;
    if (empty) empty.classList.toggle('hidden', visible > 0);

    const next = new URLSearchParams(window.location.search);
    for (const key of ['subject'] as const) {
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
      const section = state.subject ? sections.find((el) => el.dataset.section === state.subject) : undefined;
      if (section) {
        const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        section.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
      }
    });
  }
  apply();
}
