import { readFile } from 'node:fs/promises';

const [template, generated, sourceStyles, generatedStyles, sourceApp, generatedApp, baseline] =
  await Promise.all([
    readFile('website/template.html', 'utf8'),
    readFile('site/index.html', 'utf8'),
    readFile('website/styles.css', 'utf8'),
    readFile('site/styles.css', 'utf8'),
    readFile('website/app.js', 'utf8'),
    readFile('site/app.js', 'utf8'),
    readFile('website/upstream-baseline.json', 'utf8').then(JSON.parse),
  ]);

for (const value of [template, generated]) {
  if (/holo\/market|holographic interface/i.test(value)) {
    throw new Error('Legacy Holo marketplace shell is still present');
  }
}

if (!generated.includes('Basic Plugin Lab')) {
  throw new Error('Generated site is missing the Basic Plugin Lab identity');
}

if (!generated.includes(baseline.ref.slice(0, 7))) {
  throw new Error('Generated site does not identify the reviewed upstream baseline');
}

if (/github\.com\/github\/awesome-copilot\/(?:tree|blob)\/main\/(?:agents|skills|instructions|prompts|plugins)/.test(generated)) {
  throw new Error('Generated site must not publish links into the Awesome Copilot resource catalog');
}

if (/<!-- [A-Z_]+ -->/.test(generated)) {
  throw new Error('Generated site still contains unresolved template tokens');
}

if (sourceStyles !== generatedStyles || sourceApp !== generatedApp) {
  throw new Error('Generated site assets are out of sync with website source assets');
}

console.log(`Validated local Awesome Copilot structural adapter at ${baseline.ref}.`);
