import { readFileSync } from 'node:fs';

const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const releases = JSON.parse(readFileSync(new URL('../src/data/releases.json', import.meta.url), 'utf8'));
const versionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

function compareVersions(left, right) {
  const rightParts = right.split('.');
  for (const [index, part] of left.split('.').entries()) {
    const difference = BigInt(part) - BigInt(rightParts[index]);
    if (difference !== 0n) return difference > 0n ? 1 : -1;
  }
  return 0;
}

if (!Array.isArray(releases) || releases[0]?.version !== version) {
  throw new Error(`The first entry in src/data/releases.json must match package.json (${version}).`);
}

for (const [index, release] of releases.entries()) {
  if (typeof release?.version !== 'string' || !versionPattern.test(release.version)) {
    throw new Error(`Changelog entry ${index + 1} must have a MAJOR.MINOR.PATCH version.`);
  }
  if (index > 0 && compareVersions(releases[index - 1].version, release.version) <= 0) {
    throw new Error(`Changelog versions must be unique and newest first (${release.version}).`);
  }
  const date = new Date(release.date);
  if (typeof release.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(release.date) ||
      !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== release.date) {
    throw new Error(`Changelog v${release.version} must have a valid YYYY-MM-DD date.`);
  }
  const { zh, en } = release.changes ?? {};
  if (![zh, en].every((notes) => Array.isArray(notes) && notes.length && notes.every((note) => typeof note === 'string' && note.trim())) ||
      zh.length !== en.length) {
    throw new Error(`Changelog v${release.version} must have matching Chinese and English notes.`);
  }
}

console.log(`Release metadata verified for v${version}.`);
