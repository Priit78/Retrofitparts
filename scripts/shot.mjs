// Screenshot helper for agents and QA.
// Usage: node scripts/shot.mjs <url> <out.png> [width=1440] [--full] [--reduced]
import { chromium } from "@playwright/test";

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const [url, out, widthArg] = args.filter((a) => !a.startsWith("--"));

if (!url || !out) {
  console.error("Usage: node scripts/shot.mjs <url> <out.png> [width=1440] [--full] [--reduced]");
  process.exit(1);
}

const width = Number(widthArg ?? 1440);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({
  viewport: { width, height: width < 768 ? 844 : 900 },
  deviceScaleFactor: 1,
  reducedMotion: flags.has("--reduced") ? "reduce" : "no-preference",
});

const errors = [];
page.on("pageerror", (err) => errors.push(err.message));
page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text()));

await page.goto(url, { waitUntil: "networkidle" });

if (flags.has("--full")) {
  // Scroll through the page so scroll-triggered reveals run before the capture.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
}

await page.waitForTimeout(1200);
await page.screenshot({ path: out, fullPage: flags.has("--full") });
await browser.close();

console.log(`saved ${out} (${width}px)`);
if (errors.length) console.log(`page errors:\n- ${errors.join("\n- ")}`);
