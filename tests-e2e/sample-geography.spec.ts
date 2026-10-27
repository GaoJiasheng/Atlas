/** Browser gate supplied for the owning session; never invoked by the sandbox build. */
import { expect, test, type Page } from "@playwright/test";
type Geography = {
  context: { kind: string; month?: number; date?: string };
  geometryHash: string;
  countryCount: number;
  memberIds: string[];
  memberCount: number;
  selection: string | null;
  visibleLayerIds: string[];
  climateSample: unknown;
  climatology: null | { renderedMonth: number; month: number };
};
type Engine = {
  geography(): Geography;
  setGeoContext(v: unknown): boolean;
  selectGeography(id: string | null): boolean;
  goToGeographyBeat(ch: string, i: number): boolean;
  toggleGeographyLayer(id: string, on: boolean): boolean;
  sampleClimate(x: number, y: number): unknown;
};
const snapshot = (page: Page) =>
  page.evaluate(() =>
    (window.__atlas!.engine as unknown as Engine).geography(),
  );
async function open(page: Page, query = "", locale = "en") {
  await page.goto(`/${locale}/topics/sample-geography/?${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined);
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}
test.describe("date-free geography engine fixture", () => {
  for (const locale of ["en", "zh"])
    for (const theme of ["paper", "cinema"])
      test(`${locale}/${theme}: beats preserve geometry and sample climate`, async ({
        page,
      }) => {
        await open(page, `theme=${theme}`, locale);
        const initial = await snapshot(page);
        expect(initial.countryCount).toBe(3);
        expect(initial.context).toEqual({ kind: "present" });
        expect(
          await page.evaluate(() =>
            (window.__atlas!.engine as unknown as Engine).goToGeographyBeat(
              "members",
              0,
            ),
          ),
        ).toBe(true);
        expect((await snapshot(page)).memberCount).toBe(0);
        for (const [date, count] of [
          ["1967-08-08", 1],
          ["1984-01-07", 2],
          ["2025-10-25", 2],
          ["2025-10-26", 3],
        ] as const) {
          expect(
            await page.evaluate(
              (date) =>
                (window.__atlas!.engine as unknown as Engine).setGeoContext({
                  kind: "membership",
                  date,
                }),
              date,
            ),
          ).toBe(true);
          expect((await snapshot(page)).memberCount).toBe(count);
          expect((await snapshot(page)).geometryHash).toBe(
            initial.geometryHash,
          );
        }
        await page.evaluate(() =>
          (window.__atlas!.engine as unknown as Engine).goToGeographyBeat(
            "climate",
            1,
          ),
        );
        await expect
          .poll(async () => (await snapshot(page)).climatology?.renderedMonth, {
            timeout: 30_000,
          })
          .toBe(7);
        expect((await snapshot(page)).selection).toBe("cell-105-0");
        expect(
          await page.evaluate(() =>
            (window.__atlas!.engine as unknown as Engine).sampleClimate(105, 0),
          ),
        ).toMatchObject({
          month: 7,
          wind: { u: 0.11203182, v: 3.5973375 },
          rain: { rate: 3.726351 },
        });
        await page.evaluate(() =>
          (window.__atlas!.engine as unknown as Engine).goToGeographyBeat(
            "background",
            0,
          ),
        );
        expect((await snapshot(page)).climateSample).toBeNull();
        await expect(page.locator(".ts-timeline")).toHaveCount(0);
      });
  test("deep links restore authored camera before context override, canonicalize invalid fields", async ({
    page,
  }) => {
    await open(page, "ch=climate&b=2&gc=c&m=13&t=1967&at=bad&utm=keep");
    expect((await snapshot(page)).context).toEqual({
      kind: "climatology",
      month: 7,
    });
    await expect(page).toHaveURL(/gc=c/);
    await expect(page).toHaveURL(/m=7/);
    await expect(page).not.toHaveURL(/[?&](?:t|at)=/);
    await expect(page).toHaveURL(/utm=keep/);
    await open(page, "ch=members&b=1&gc=a&at=2025-10-26");
    expect((await snapshot(page)).memberCount).toBe(3);
    expect(await page.evaluate(() => window.__atlas!.state())).toMatchObject({
      beat: 0,
      t: null,
    });
  });
  test("country-scale case selection and layer-off count preserve semantics", async ({
    page,
  }) => {
    await open(page, "ch=members&gc=a&at=2025-10-26");
    await page.locator('[data-geography-index="case-bukit-timah"]').click();
    await expect(page.locator("[data-geography-selection]")).toContainText(
      "Country-scale reference",
    );
    await page.locator('[data-geography-index="case-sungei-buloh"]').click();
    expect((await snapshot(page)).selection).toBe("case-sungei-buloh");
    await page.evaluate(() =>
      (window.__atlas!.engine as unknown as Engine).toggleGeographyLayer(
        "geo-membership",
        false,
      ),
    );
    expect((await snapshot(page)).memberCount).toBe(3);
    await expect(page.locator("[data-member-count]")).toContainText(
      "Membership layer off",
    );
  });
  test("phone has date/month controls and index; no hover required", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, "ch=members");
    // The phone reader starts folded; its context entry lives inside it (as on sample-climate).
    await page.locator('.atlas-panel__toggle[aria-expanded="false"]').click();
    await page.locator(".geo-phone-context summary").click();
    await page
      .locator(".geo-phone-context [data-membership-date]")
      .selectOption("2025-10-26");
    expect((await snapshot(page)).memberCount).toBe(3);
  });
});
