import { expect, test, type Locator, type Page } from "@playwright/test";
// Content files only import types, so the tests can use the real copy.
import { catalog } from "../src/content/catalog";
import { common } from "../src/content/common";
import { inquiry } from "../src/content/inquiry";
import { layout } from "../src/content/layout";
import { site } from "../src/content/site";

const productPath = "/et/catalog/koito-bi-led";
/** Landing sections the navigation points at; the page must always have them. */
const navSections = site.nav.filter((item) => item.href.startsWith("#")).map((item) => item.href.slice(1));

/** Waits until React has hydrated the element, so clicks and changes reach its handlers. */
async function hydrated(locator: Locator) {
  await expect
    .poll(() => locator.evaluate((el) => Object.keys(el).some((key) => key.startsWith("__reactFiber"))))
    .toBe(true);
}

/** Scrolls through the whole page, so every scroll-driven part has run. */
async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
  });
}

test.describe("at 360 px", () => {
  test.use({ viewport: { width: 360, height: 780 } });

  for (const path of ["/et", "/en", "/et/catalog", productPath]) {
    test(`${path} never scrolls sideways`, async ({ page }) => {
      await page.goto(path);
      await scrollThrough(page);
      const { scrollWidth, innerWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
    });
  }
});

test.describe("with reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("every landing section heading shows at once", async ({ page }) => {
    await page.goto("/et");
    const ids = await page.locator("main section[id]").evaluateAll((sections) => sections.map((el) => el.id));
    expect(ids).toEqual(expect.arrayContaining(navSections));
    for (const id of ids) {
      const heading = page.locator(`[id="${id}"]`).getByRole("heading").first();
      await expect(heading, id).toBeVisible();
      // toBeVisible ignores opacity: check that nothing on the way up hides the heading.
      const opacity = await heading.evaluate((el) => {
        let value = 1;
        for (let node: Element | null = el; node; node = node.parentElement) {
          value *= Number(getComputedStyle(node).opacity);
        }
        return value;
      });
      expect(opacity, id).toBe(1);
    }
  });
});

test.describe("catalog", () => {
  const cards = (page: Page) => page.locator("[data-product-card]");

  test("?category=lenses shows only lens cards", async ({ page }) => {
    await page.goto("/et/catalog?category=lenses");
    // The static HTML lists everything; the query is applied once the page has hydrated.
    await expect(page.locator('[data-product-card]:not([data-category="lenses"])')).toHaveCount(0);
    await expect(cards(page).first()).toBeVisible();
  });

  test("the category list and the make select update the URL", async ({ page }) => {
    await page.goto("/et/catalog");
    const sidebar = page.getByRole("complementary", { name: catalog.filters.title.et });
    await hydrated(sidebar);

    await sidebar.getByRole("button", { name: /^Tuleklaasid/ }).click();
    await expect(page).toHaveURL(/category=lenses/);

    await sidebar.getByLabel(catalog.filters.make.et).selectOption("BMW");
    await expect(page).toHaveURL(/category=lenses&make=BMW/);
    await expect(page.locator('[data-product-card]:not([data-category="lenses"])')).toHaveCount(0);
    await expect(cards(page).first()).toBeVisible();
  });

  test("?make=Tesla shows the empty state", async ({ page }) => {
    await page.goto("/et/catalog?make=Tesla");
    await expect(page.getByRole("heading", { name: catalog.empty.title.et })).toBeVisible();
    await expect(cards(page)).toHaveCount(0);
  });
});

test.describe("language switch", () => {
  test("keeps the product page", async ({ page }) => {
    await page.goto(productPath);
    await page.getByRole("link", { name: `EN – ${layout.language.names.en}` }).click();
    await expect(page).toHaveURL("/en/catalog/koito-bi-led");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("keeps the catalog filters, also ones set after loading", async ({ page }) => {
    await page.goto("/et/catalog?category=lenses");
    const sidebar = page.getByRole("complementary", { name: catalog.filters.title.et });
    await hydrated(sidebar);
    await sidebar.getByLabel(catalog.filters.make.et).selectOption("BMW");
    await expect(page).toHaveURL(/make=BMW/);

    await page.getByRole("link", { name: `EN – ${layout.language.names.en}` }).click();
    await expect(page).toHaveURL("/en/catalog?category=lenses&make=BMW");
    await expect(page.getByRole("button", { name: catalog.filters.remove.en("BMW") })).toBeVisible();
  });
});

test.describe("unknown pages", () => {
  test("an unknown locale is a 404", async ({ page }) => {
    const response = await page.goto("/de");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: common.notFoundTitle.et })).toBeVisible();
  });

  test("an unknown product is a 404", async ({ page }) => {
    const response = await page.goto("/et/catalog/nope");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: common.notFoundTitle.et })).toBeVisible();
  });
});

test("the inquiry form, sent empty, shows field errors without a request", async ({ page }) => {
  await page.goto("/et");
  const form = page.locator('[id="contact"] form');
  await hydrated(form);

  const posts: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") posts.push(request.url());
  });

  await form.getByRole("button", { name: inquiry.submit.et }).click();

  const errors = inquiry.fieldErrors;
  await expect(form.getByText(errors["name-length"].et)).toBeVisible();
  await expect(form.getByText(errors["contact-required"].et)).toBeVisible();
  await expect(form.getByText(errors["message-required"].et)).toBeVisible();
  await expect(form.getByLabel(inquiry.labels.name.et)).toHaveAttribute("aria-invalid", "true");
  await expect(form.getByLabel(inquiry.labels.name.et)).toBeFocused();
  expect(posts).toEqual([]);
});

test("/et logs no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/et", { waitUntil: "networkidle" });
  await scrollThrough(page);
  await page.waitForTimeout(1000);
  expect(errors).toEqual([]);
});

test.describe("navigation to a section", () => {
  /**
   * Waits for the scroll to settle, then returns where the section sits and the limits it
   * must respect: its own `scroll-margin-top`, and the bottom of the fixed header.
   */
  async function landing(page: Page, id: string) {
    const measure = () =>
      page.locator(`[id="${id}"]`).evaluate((el) => ({
        top: el.getBoundingClientRect().top,
        margin: parseFloat(getComputedStyle(el).scrollMarginTop) || 0,
        header: document.getElementById("site-header")?.getBoundingClientRect().bottom ?? 0,
      }));
    let last = Number.NaN;
    await expect
      .poll(
        async () => {
          const { top } = await measure();
          const settled = Math.abs(top - last) < 0.5;
          last = top;
          return settled;
        },
        { intervals: [250] },
      )
      .toBe(true);
    return measure();
  }

  async function expectLandedBelowHeader(page: Page, id: string) {
    const { top, margin, header } = await landing(page, id);
    expect(Math.abs(top - margin), `${id} sits at its scroll margin`).toBeLessThanOrEqual(4);
    expect(top, `${id} is not under the header`).toBeGreaterThanOrEqual(header - 1);
  }

  /** Records the scroll position on every frame; the check fails on any step back (a double jump). */
  async function recordScroll(page: Page) {
    await page.evaluate(() => {
      const w = window as unknown as { scrollLog: number[] };
      w.scrollLog = [];
      const log = () => {
        w.scrollLog.push(window.scrollY);
        requestAnimationFrame(log);
      };
      requestAnimationFrame(log);
    });
    return async () => {
      const log = await page.evaluate(() => (window as unknown as { scrollLog: number[] }).scrollLog);
      const steps = log.slice(1).map((y, i) => y - log[i]);
      expect(steps.every((step) => step >= -1), `scrolls one way only: ${log.join(" ")}`).toBe(true);
    };
  }

  const servicesLabel = site.nav[0].label.et;
  const headerLink = (page: Page) =>
    page.getByRole("navigation", { name: layout.header.mainNav.et }).getByRole("link", { name: servicesLabel });

  test("a header link scrolls once, lands below the header and moves focus there", async ({ page }) => {
    await page.goto("/et");
    await hydrated(headerLink(page));
    const expectOneWay = await recordScroll(page);

    await headerLink(page).click();

    await expectLandedBelowHeader(page, "services");
    await expectOneWay();
    await expect(page).toHaveURL("/et#services");
    await expect(page.locator('[id="services"]')).toBeFocused();
  });

  test("an in-page link to the contact form scrolls once too", async ({ page }) => {
    await page.goto("/et");
    await hydrated(headerLink(page));
    const link = page.locator('main a[href="#contact"]').last();
    await link.scrollIntoViewIfNeeded();
    const expectOneWay = await recordScroll(page);

    await link.click();

    await expectLandedBelowHeader(page, "contact");
    await expectOneWay();
    await expect(page).toHaveURL("/et#contact");
  });

  test("from the catalog, a header link opens the landing page at the section", async ({ page }) => {
    await page.goto("/et/catalog");
    await hydrated(headerLink(page));
    await headerLink(page).click();
    await expect(page).toHaveURL("/et#services");
    await expectLandedBelowHeader(page, "services");
  });

  test.describe("on a phone", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("a menu link closes the menu and lands at the section", async ({ page }) => {
      await page.goto("/et");
      const open = page.getByRole("button", { name: layout.header.openMenu.et });
      await hydrated(open);
      await open.click();
      const menu = page.getByRole("dialog", { name: layout.header.menu.et });
      await menu.getByRole("link", { name: servicesLabel }).click();

      await expect(menu).toBeHidden();
      await expect(page).toHaveURL("/et#services");
      await expectLandedBelowHeader(page, "services");
    });
  });
});
