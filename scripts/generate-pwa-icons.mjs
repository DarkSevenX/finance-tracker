import { mkdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "public", "icons");
mkdirSync(outDir, { recursive: true });

const svgPath = join(outDir, "icon.svg");
const svg = readFileSync(svgPath);

for (const size of [192, 512, 180]) {
  await sharp(svg).resize(size, size).png().toFile(join(outDir, `icon-${size}.png`));
}

console.log("Iconos PWA generados: icon-192.png, icon-512.png, icon-180.png");
