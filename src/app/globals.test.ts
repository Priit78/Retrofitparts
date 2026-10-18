// @vitest-environment node
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compile } from "tailwindcss";
import { beforeAll, describe, expect, it } from "vitest";

/**
 * Compiles globals.css with Tailwind, as the build does, and checks where the scroll-story rules
 * land: pinning must only happen when JS has run and the visitor allows motion.
 */

const PINNED = "@media (prefers-reduced-motion: no-preference)";
const PINNED_LG = "@media (prefers-reduced-motion: no-preference) and (width >= 64rem)";

let css = "";

beforeAll(async () => {
  const resolver = createRequire(import.meta.url);
  const file = fileURLToPath(new URL("./globals.css", import.meta.url));
  const compiler = await compile(await readFile(file, "utf8"), {
    base: path.dirname(file),
    loadStylesheet: async (id, base) => {
      const sheet = id === "tailwindcss" ? resolver.resolve("tailwindcss/index.css") : path.resolve(base, id);
      return { path: sheet, base: path.dirname(sheet), content: await readFile(sheet, "utf8") };
    },
  });
  css = compiler.build(["pinned:sticky", "pinned-lg:sticky"]).replace(/\s+/g, " ");
});

/** The bodies of every `header { … }` block, and the CSS left once they are cut out. */
function split(header: string, source = css): { inside: string; outside: string } {
  const inside: string[] = [];
  let outside = "";
  let from = 0;
  for (;;) {
    const at = source.indexOf(`${header} {`, from);
    if (at === -1) break;
    const open = at + header.length + 1;
    let depth = 0;
    let close = open;
    for (; close < source.length; close++) {
      if (source[close] === "{") depth++;
      if (source[close] === "}" && --depth === 0) break;
    }
    outside += source.slice(from, at);
    inside.push(source.slice(open + 1, close).trim());
    from = close + 1;
  }
  return { inside: inside.join(" "), outside: outside + source.slice(from) };
}

describe("pinned variants", () => {
  it("pinned: applies with JS and motion allowed", () => {
    expect(split(PINNED).inside).toContain(".pinned\\:sticky:where(html.js *) { position: sticky; }");
  });

  it("pinned-lg: applies with JS and motion allowed, from 1024 px", () => {
    expect(split(PINNED_LG).inside).toContain(".pinned-lg\\:sticky:where(html.js *) { position: sticky; }");
  });
});

describe("chapter CSS", () => {
  const base = '.chapter:not([data-pin-from="lg"])';
  const lg = '.chapter[data-pin-from="lg"]';
  const stage = "position: sticky; top: 0; height: 100svh; overflow: hidden;";

  it("pins a chapter at every width by default", () => {
    const pinned = split(PINNED).inside;
    expect(pinned).toContain(`${base}:where(html.js *) { height: var(--chapter-len); }`);
    expect(pinned).toContain(
      `@media (width >= 48rem) { ${base}:where(html.js *) { height: var(--chapter-len-md); } }`,
    );
    expect(pinned).toContain(`${base} > .chapter-stage:where(html.js *) { ${stage} }`);
    expect(pinned).toContain(`${base} [data-pinned-hidden]:where(html.js *) { opacity: 0; }`);
  });

  it('pins a data-pin-from="lg" chapter from 1024 px only', () => {
    const pinnedLg = split(PINNED_LG).inside;
    expect(pinnedLg).toContain(`${lg}:where(html.js *) { height: var(--chapter-len-md); }`);
    expect(pinnedLg).toContain(`${lg} > .chapter-stage:where(html.js *) { ${stage} }`);
    expect(pinnedLg).toContain(`${lg} [data-pinned-hidden]:where(html.js *) { opacity: 0; }`);
  });

  it("leaves chapters as plain blocks without JS or with reduced motion", () => {
    const { outside } = split(PINNED, split(PINNED_LG).outside);
    expect(outside).not.toContain(".chapter");
    expect(outside).not.toContain("data-pinned-hidden");
  });
});
