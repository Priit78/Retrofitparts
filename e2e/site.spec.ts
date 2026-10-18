import { expect, test, type Locator, type Page } from "@playwright/test";
// Content files only import types, so the tests can use the real copy.
import { catalog } from "../src/content/catalog";
import { common } from "../src/content/common";
import { inquiry } from "../src/content/inquiry";
import { layout } from "../src/content/layout";
import { polish } from "../src/content/polish";
import { processCopy } from "../src/content/process";
import { site } from "../src/content/site";
import { story } from "../src/content/story";

const productPath = "/et/catalog/koito-bi-led";
/** Landing sections the navigation points at; the page must always have them. */
const navSections = site.nav.filter((item) => item.href.startsWith("#")).map((item) => item.href.slice(1));

/** Waits until React has hydrated the element, so clicks and changes reach its handlers. */
async function hydrated(locator: Locator) {
  await expect
    .poll(() => locator.evaluate((el) => Object.keys(el).some((key) => key.startsWith("__reactFiber"))))
    .toBe(true);
}

/** The element's opacity times every ancestor's: how much of it the visitor sees. */
function shownOpacity(locator: Locator) {
  return locator.evaluate((el) => {
    let value = 1;
    for (let node: Element | null = el; node; node = node.parentElement) {
      value *= Number(getComputedStyle(node).opacity);
    }
    return value;
  });
}

/**
 * Scrolls the window, at once, to progress `p` of a scroll-story chapter: 0 when its stage reaches
 * the top, 1 at the end of its track.
 */
async function seekChapter(page: Page, id: string, p: number) {
  await page.evaluate(
    ({ id, p }) => {
      const section = document.getElementById(id);
      if (!section) throw new Error(`No #${id}`);
      const top = section.getBoundingClientRect().top + window.scrollY;
      const travel = section.offsetHeight - document.documentElement.clientHeight;
      window.scrollTo({ top: top + p * travel, behavior: "instant" });
    },
    { id, p },
  );
}

/** Whether the page is wider than the viewport. */
function pageOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
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
    // The story's chapters (top, problem, difference, anatomy, services, process, catalog-teaser)
    // and what the navigation points at.
    expect(ids).toEqual(expect.arrayContaining([...story.chapters.map((chapter) => chapter.id), ...navSections]));
    for (const id of ids) {
      const heading = page.locator(`[id="${id}"]`).getByRole("heading").first();
      await expect(heading, id).toBeVisible();
      // toBeVisible ignores opacity: check that nothing on the way up hides the heading.
      expect(await shownOpacity(heading), id).toBe(1);
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

test.describe("header", () => {
  const backdrop = (page: Page) => page.locator("header [data-header-backdrop]");

  test("is transparent over the landing hero and turns solid once the page scrolls", async ({ page }) => {
    await page.goto("/et");
    await hydrated(backdrop(page));
    await expect(backdrop(page)).not.toHaveAttribute("data-solid");
    await page.evaluate(() => window.scrollTo(0, 600));
    await expect(backdrop(page)).toHaveAttribute("data-solid", "");
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(backdrop(page)).not.toHaveAttribute("data-solid");
  });

  test("is solid from the first paint on pages without a hero", async ({ page }) => {
    await page.goto("/et/catalog");
    await expect(backdrop(page)).toHaveAttribute("data-solid", "");
  });
});

test("a catalog teaser tile opens a view with exactly the products it counts", async ({ page }) => {
  await page.goto("/et");
  const link = page.locator("#catalog-teaser").getByRole("link", { name: catalog.teaser.tiles.xenon.title.et, exact: true });
  // The count sits next to the link, in the same tile.
  const count = Number(
    await link.locator("xpath=ancestor::h3/following-sibling::p[@data-tile-count][1]").getAttribute("data-tile-count"),
  );
  expect(count).toBeGreaterThan(0);
  await hydrated(link);
  // The pinned strip has moved the xenon tile fully into view by its end.
  await seekChapter(page, "catalog-teaser", 1);
  await expect(page.locator('[data-teaser-tile="xenon"]')).toBeInViewport({ ratio: 1 });
  await link.click();
  await expect(page).toHaveURL(/\/et\/catalog\?category=[a-z-]+(,[a-z-]+)+$/);
  await expect(page.locator("[data-product-card]")).toHaveCount(count);
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

for (const path of ["/et", "/en"]) {
  test(`${path} logs no console errors through a full scroll`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto(path, { waitUntil: "networkidle" });
    await scrollThrough(page);
    await page.waitForTimeout(1000);
    expect(errors).toEqual([]);
  });
}

test.describe("the scroll story", () => {
  const [aging, polishing] = story.problem.beats;
  const problemTitle = (page: Page, title: string) =>
    page.locator("#problem").getByRole("heading", { name: title, exact: true });

  test("before hydration, a pinned chapter shows only its first beat", async ({ page }) => {
    // The inline script marks the page as running JS, but no script chunk loads: nothing
    // hydrates. (The stylesheets are chunks too, and they must load.)
    await page.route("**/_next/static/chunks/**", (route) =>
      route.request().resourceType() === "script" ? route.abort() : route.fallback(),
    );
    await page.goto("/et");
    await expect(problemTitle(page, aging.title.et)).toBeVisible();
    expect(await shownOpacity(problemTitle(page, aging.title.et))).toBe(1);
    // Hidden by opacity only: its text stays readable to assistive technology.
    expect(await shownOpacity(problemTitle(page, polishing.title.et))).toBe(0);
  });

  test("at load, the problem chapter shows its first beat and hides the second", async ({ page }) => {
    await page.goto("/et");
    await expect(page.locator("#problem")).toHaveAttribute("data-animated", "");
    expect(await shownOpacity(problemTitle(page, aging.title.et))).toBe(1);
    expect(await shownOpacity(problemTitle(page, polishing.title.et))).toBe(0);
  });

  test("the middle of the problem chapter shows the polished photo's caption", async ({ page }) => {
    await page.goto("/et");
    await expect(page.locator("#problem")).toHaveAttribute("data-animated", "");
    const after = page.locator("#problem").getByText(polish.photos.polished.caption.et, { exact: true });
    await expect(after).toBeHidden();
    await seekChapter(page, "problem", 0.5);
    await expect(after).toBeVisible();
  });

  test("the end of the fix chapter marks its last part, the housing", async ({ page }) => {
    await page.goto("/et");
    await expect(page.locator("#anatomy")).toHaveAttribute("data-animated", "");
    await seekChapter(page, "anatomy", 1);
    const housing = polish.parts[polish.parts.length - 1].name.et;
    expect(housing).toBe("Korpus");
    await expect(page.locator('#anatomy [aria-current="step"]')).toHaveCount(1);
    await expect(page.locator('#anatomy [aria-current="step"] h3')).toHaveText(housing);
  });

  /** The catalog chapter's row of tiles. */
  const track = (page: Page) => page.locator("#catalog-teaser ul:has(> li[data-teaser-tile])");

  test.describe("at 1440 px", () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test("the catalog strip moves sideways as the chapter scrolls", async ({ page }) => {
      await page.goto("/et");
      await expect(page.locator("#catalog-teaser")).toHaveAttribute("data-animated", "");
      const shift = () => track(page).evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);

      await seekChapter(page, "catalog-teaser", 0);
      await expect.poll(shift).toBe(0);
      await seekChapter(page, "catalog-teaser", 1);
      await expect.poll(shift).toBeLessThan(-100);
      // The last card ends in view.
      await expect(page.locator('[data-teaser-tile="all"]')).toBeInViewport({ ratio: 1 });
    });

    test("resizing to a phone and back, mid-chapter, never scrolls sideways", async ({ page }) => {
      await page.goto("/et");
      await expect(page.locator("#catalog-teaser")).toHaveAttribute("data-animated", "");
      await seekChapter(page, "catalog-teaser", 0.6);
      await expect.poll(() => track(page).evaluate((el) => getComputedStyle(el).transform)).not.toBe("none");

      await page.setViewportSize({ width: 390, height: 844 });
      await expect(page.locator("#catalog-teaser")).not.toHaveAttribute("data-animated");
      // The strip drops its pinned translation: a swipe row again.
      expect(await track(page).evaluate((el) => getComputedStyle(el).transform)).toBe("none");
      await expect.poll(() => pageOverflow(page)).toBeLessThanOrEqual(0);
      await scrollThrough(page);
      expect(await pageOverflow(page)).toBeLessThanOrEqual(0);

      await page.setViewportSize({ width: 1440, height: 900 });
      await expect(page.locator("#catalog-teaser")).toHaveAttribute("data-animated", "");
      await seekChapter(page, "catalog-teaser", 0.6);
      await expect.poll(() => pageOverflow(page)).toBeLessThanOrEqual(0);
      await scrollThrough(page);
      expect(await pageOverflow(page)).toBeLessThanOrEqual(0);
    });
  });

  test.describe("at 390 px", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("the catalog row swipes inside its own box, and the page never scrolls sideways", async ({ page }) => {
      await page.goto("/et");
      const row = track(page);
      await row.scrollIntoViewIfNeeded();
      const box = () => row.evaluate((el) => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, left: el.scrollLeft }));
      const before = await box();
      expect(before.scrollWidth).toBeGreaterThan(before.clientWidth);
      expect(before.left).toBe(0);

      await row.evaluate((el) => el.scrollBy({ left: 300, behavior: "instant" }));
      await expect.poll(async () => (await box()).left).toBeGreaterThan(0);
      expect(await track(page).evaluate((el) => getComputedStyle(el).transform)).toBe("none");
      expect(await pageOverflow(page)).toBeLessThanOrEqual(0);
    });
  });
});

test.describe("without JS", () => {
  test.use({ javaScriptEnabled: false });

  test("every problem beat and every process step is shown", async ({ page }) => {
    await page.goto("/et");
    for (const beat of story.problem.beats) {
      const title = page.locator("#problem").getByRole("heading", { name: beat.title.et, exact: true });
      await expect(title, beat.title.et).toBeVisible();
      expect(await shownOpacity(title), beat.title.et).toBe(1);
    }
    for (const step of processCopy.steps) {
      const title = page.locator("#process").getByRole("heading", { name: step.title.et, exact: true });
      await expect(title, step.title.et).toBeVisible();
      expect(await shownOpacity(title), step.title.et).toBe(1);
    }
  });
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

  test("the header link to the process chapter lands at its start, below the header", async ({ page }) => {
    await page.goto("/et");
    await hydrated(headerLink(page));
    const processLink = page
      .getByRole("navigation", { name: layout.header.mainNav.et })
      .getByRole("link", { name: site.nav.find((item) => item.href === "#process")!.label.et });
    const expectOneWay = await recordScroll(page);

    await processLink.click();

    await expectLandedBelowHeader(page, "process");
    await expectOneWay();
    await expect(page).toHaveURL("/et#process");
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

  test.describe("at 1440 px", () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test("the chapter index jumps to the fix chapter's start, below the header", async ({ page }) => {
      await page.goto("/et");
      const index = page.getByRole("navigation", { name: story.index.label.et });
      await hydrated(index);
      const label = story.chapters.find((chapter) => chapter.id === "anatomy")!.label.et;
      const expectOneWay = await recordScroll(page);

      await index.getByRole("link", { name: label, exact: true }).click();

      await expectLandedBelowHeader(page, "anatomy");
      await expectOneWay();
      await expect(page).toHaveURL("/et#anatomy");
      await expect(index.getByRole("link", { name: label, exact: true })).toHaveAttribute("aria-current", "location");
    });
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
