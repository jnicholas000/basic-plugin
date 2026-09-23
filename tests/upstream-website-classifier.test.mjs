import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyWebsiteChange } from '../eng/upstream-website-classifier.mjs';

const packageWith = (dependencies) => ({ dependencies });

test('small website edits remain routine', () => {
  const result = classifyWebsiteChange({
    files: [
      { status: 'M', path: 'website/src/components/Card.tsx' },
      { status: 'M', path: 'website/src/styles/card.css' },
      { status: 'M', path: 'website/src/pages/index.astro' },
    ],
    basePackage: packageWith({ astro: '^7.1.0' }),
    headPackage: packageWith({ astro: '^7.3.0' }),
  });

  assert.equal(result.classification, 'routine');
});

test('broad non-architectural changes require review', () => {
  const files = Array.from({ length: 30 }, (_, index) => ({
    status: 'M',
    path: `website/src/components/Component${index}.tsx`,
  }));

  const result = classifyWebsiteChange({
    files,
    basePackage: packageWith({ astro: '^7.1.0' }),
    headPackage: packageWith({ astro: '^7.3.0' }),
  });

  assert.equal(result.classification, 'review');
});

test('adding Starlight is classified as an architecture migration', () => {
  const result = classifyWebsiteChange({
    files: [{ status: 'M', path: 'website/package.json' }],
    basePackage: packageWith({ astro: '^5.0.0' }),
    headPackage: packageWith({ astro: '^5.0.0', '@astrojs/starlight': '^0.32.0' }),
  });

  assert.equal(result.classification, 'architecture');
  assert.match(result.architectureSignals.join('\n'), /starlight/);
});

test('replacing Starlight with React and Primer Brand is an architecture migration', () => {
  const result = classifyWebsiteChange({
    files: [
      ...Array.from({ length: 114 }, (_, index) => ({ status: 'A', path: `website/new/${index}.tsx` })),
      ...Array.from({ length: 46 }, (_, index) => ({ status: 'D', path: `website/old/${index}.astro` })),
      ...Array.from({ length: 26 }, (_, index) => ({ status: 'M', path: `website/shared/${index}.ts` })),
    ],
    basePackage: packageWith({ astro: '^7.1.0', '@astrojs/starlight': '^0.35.0' }),
    headPackage: packageWith({
      astro: '^7.3.0',
      '@astrojs/react': '^4.3.0',
      '@primer/react-brand': '^0.56.0',
      react: '^19.0.0',
      'react-dom': '^19.0.0',
    }),
  });

  assert.equal(result.classification, 'architecture');
  assert.match(result.architectureSignals.join('\n'), /starlight/);
  assert.match(result.architectureSignals.join('\n'), /react/);
});

test('framework major version changes stop automatic synchronization', () => {
  const result = classifyWebsiteChange({
    files: [{ status: 'M', path: 'website/package.json' }],
    basePackage: packageWith({ astro: '^6.10.0' }),
    headPackage: packageWith({ astro: '^7.0.0' }),
  });

  assert.equal(result.classification, 'architecture');
  assert.match(result.architectureSignals.join('\n'), /astro 6 -> 7/);
});

test('removing a critical website root file stops automatic synchronization', () => {
  const result = classifyWebsiteChange({
    files: [{ status: 'D', path: 'website/astro.config.mjs' }],
    basePackage: packageWith({ astro: '^7.3.0' }),
    headPackage: packageWith({ astro: '^7.3.0' }),
  });

  assert.equal(result.classification, 'architecture');
});
