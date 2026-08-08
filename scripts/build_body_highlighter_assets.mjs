import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const sourceDir = path.join(projectRoot, "vendor", "react-native-body-highlighter", "assets");
const outputDir = path.join(projectRoot, "static", "data", "body-highlighter");

async function readBodyParts(fileName, exportName) {
  const source = await fs.readFile(path.join(sourceDir, fileName), "utf8");
  const marker = `export const ${exportName}: BodyPart[] =`;
  const start = source.indexOf(marker);
  const end = source.lastIndexOf("];");
  if (start < 0 || end < 0) throw new Error(`Unable to parse ${fileName}`);
  const literal = source.slice(start + marker.length, end + 1).trim();
  return Function(`"use strict"; return (${literal});`)();
}

await fs.mkdir(outputDir, { recursive: true });
const [front, back] = await Promise.all([
  readBodyParts("bodyFront.ts", "bodyFront"),
  readBodyParts("bodyBack.ts", "bodyBack"),
]);

await Promise.all([
  fs.writeFile(path.join(outputDir, "male-front.json"), `${JSON.stringify(front)}\n`, "utf8"),
  fs.writeFile(path.join(outputDir, "male-back.json"), `${JSON.stringify(back)}\n`, "utf8"),
]);

console.log(`body-highlighter assets: front=${front.length}, back=${back.length}`);
