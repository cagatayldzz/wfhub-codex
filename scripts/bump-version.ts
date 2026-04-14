/// <reference types="bun" />
/// <reference types="node" />

const latestTag = process.env.LATEST_TAG ?? "v0.0.0";
const [major, minor, patch] = latestTag
  .replace(/^v/, "")
  .split(".")
  .map(Number);

const nextVersion = `${major}.${minor}.${patch + 1}`;
const packageJson = await Bun.file("package.json").json();

packageJson.version = nextVersion;

await Bun.write("package.json", `${JSON.stringify(packageJson, null, 2)}\n`);

console.log(nextVersion);

export {};
