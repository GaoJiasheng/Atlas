/** A locale resource shared by hydration, engine views and repeated renders. */
export function createUiLoader<L extends string, D>(loaders: Record<L, () => Promise<D>>) {
  const loaded = new Map<L, D>();
  const pending = new Map<L, Promise<void>>();
  const failed = new Map<L, unknown>();
  function load(locale: L): Promise<void> {
    if (loaded.has(locale)) return Promise.resolve();
    let request = pending.get(locale);
    if (!request) {
      failed.delete(locale);
      request = loaders[locale]().then(
        dictionary => { loaded.set(locale, dictionary); pending.delete(locale); },
        error => { failed.set(locale, error); pending.delete(locale); throw error; },
      );
      pending.set(locale, request);
    }
    return request;
  }
  return {
    load,
    read(locale: L): D {
      if (loaded.has(locale)) return loaded.get(locale)!;
      if (failed.has(locale)) throw failed.get(locale);
      throw load(locale);
    },
  };
}
