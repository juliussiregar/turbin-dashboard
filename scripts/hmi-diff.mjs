#!/usr/bin/env node
/**
 * Screenshot generator zone render and compare to patokan PNG.
 * Usage: npm run hmi:diff  (dev server must be running on port 3000)
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const publicHmi = path.join(root, "public", "hmi");
const referencePath = path.join(publicHmi, "patokan-generator-zone.png");
const currentPath = path.join(publicHmi, "last-render.png");
const diffPath = path.join(publicHmi, "last-diff.png");
const compareUrl = process.env.HMI_COMPARE_URL ?? "http://localhost:3000/dev/generator-compare";
const threshold = Number(process.env.HMI_DIFF_THRESHOLD ?? "10");

const WIDTH = 380;
const HEIGHT = 420;

function loadPng(filePath) {
  const buf = fs.readFileSync(filePath);
  return PNG.sync.read(buf);
}

async function screenshotElement() {
  const script = `
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 800, height: 900 } });
  await page.goto('${compareUrl}', { waitUntil: 'networkidle' });
  const el = page.locator('#generator-render');
  await el.waitFor({ state: 'visible' });
  await el.screenshot({ path: '${currentPath.replace(/\\/g, "\\\\")}' });
  await browser.close();
})();
`;

  const tmpScript = path.join(root, "scripts", ".hmi-diff-shot.cjs");
  fs.writeFileSync(tmpScript, script);
  await new Promise((resolve, reject) => {
    const child = spawn("node", [tmpScript], { cwd: root, stdio: "inherit" });
    child.on("exit", (code) => {
      try { fs.unlinkSync(tmpScript); } catch { /* ignore */ }
      code === 0 ? resolve(undefined) : reject(new Error(`screenshot script exit ${code}`));
    });
  });
}

function compareImages() {
  const ref = loadPng(referencePath);
  const cur = loadPng(currentPath);

  if (ref.width !== cur.width || ref.height !== cur.height) {
    console.error(`Size mismatch: ref ${ref.width}x${ref.height} vs current ${cur.width}x${cur.height}`);
    process.exit(1);
  }

  const diff = new PNG({ width: ref.width, height: ref.height });
  const mismatched = pixelmatch(ref.data, cur.data, diff.data, ref.width, ref.height, {
    threshold: 0.12,
    includeAA: true,
  });

  const total = ref.width * ref.height;
  const percent = (mismatched / total) * 100;

  fs.writeFileSync(diffPath, PNG.sync.write(diff));

  console.log("");
  console.log("=== HMI Generator Zone Diff ===");
  console.log(`Reference : ${referencePath}`);
  console.log(`Current   : ${currentPath}`);
  console.log(`Diff image: ${diffPath}`);
  console.log(`Mismatched pixels: ${mismatched} / ${total}`);
  console.log(`Diff score: ${percent.toFixed(2)}%`);
  console.log(`Threshold : ${threshold}%`);

  if (percent <= threshold) {
    console.log("PASS — within threshold");
    process.exit(0);
  }

  console.log("FAIL — still too different from patokan");
  process.exit(1);
}

async function main() {
  if (!fs.existsSync(referencePath)) {
    console.error(`Missing reference: ${referencePath}`);
    process.exit(1);
  }

  console.log(`Capturing ${compareUrl} #generator-render ...`);
  await screenshotElement();
  compareImages();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
