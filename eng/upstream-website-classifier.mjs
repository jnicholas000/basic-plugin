const ARCHITECTURE_DEPENDENCIES = [
  '@astrojs/react',
  '@astrojs/starlight',
  '@primer/react-brand',
  'astro',
  'react',
  'react-dom',
];

const CRITICAL_PATHS = new Set([
  'website/package.json',
  'website/astro.config.mjs',
]);

function dependencyMap(packageJson) {
  if (!packageJson) return new Map();

  return new Map(
    Object.entries({
      ...(packageJson.dependencies ?? {}),
      ...(packageJson.devDependencies ?? {}),
      ...(packageJson.peerDependencies ?? {}),
    }),
  );
}

function versionMajor(value) {
  if (typeof value !== 'string') return null;

  const match = value.match(/(?:^|[^0-9])(\d+)(?:\.|$)/);
  return match ? Number(match[1]) : null;
}

function frameworkSignals(basePackage, headPackage) {
  const baseDependencies = dependencyMap(basePackage);
  const headDependencies = dependencyMap(headPackage);
  const signals = [];

  for (const dependency of ARCHITECTURE_DEPENDENCIES) {
    const baseVersion = baseDependencies.get(dependency);
    const headVersion = headDependencies.get(dependency);

    if (!baseVersion && headVersion) {
      signals.push(`framework dependency added: ${dependency}`);
      continue;
    }

    if (baseVersion && !headVersion) {
      signals.push(`framework dependency removed: ${dependency}`);
      continue;
    }

    if (baseVersion && headVersion) {
      const baseMajor = versionMajor(baseVersion);
      const headMajor = versionMajor(headVersion);
      if (baseMajor !== null && headMajor !== null && baseMajor !== headMajor) {
        signals.push(`framework major changed: ${dependency} ${baseMajor} -> ${headMajor}`);
      }
    }
  }

  return signals;
}

export function classifyWebsiteChange({ files, basePackage, headPackage }) {
  const websiteFiles = files.filter((file) => file.path.startsWith('website/'));
  const added = websiteFiles.filter((file) => file.status === 'A').length;
  const removed = websiteFiles.filter((file) => file.status === 'D').length;
  const modified = websiteFiles.length - added - removed;
  const architectureSignals = frameworkSignals(basePackage, headPackage);

  for (const file of websiteFiles) {
    if (file.status === 'D' && CRITICAL_PATHS.has(file.path)) {
      architectureSignals.push(`critical website path removed: ${file.path}`);
    }
  }

  if (added >= 20 && removed >= 20) {
    architectureSignals.push(`structural replacement detected: ${added} files added and ${removed} removed`);
  }

  if (websiteFiles.length >= 100) {
    architectureSignals.push(`very large website change: ${websiteFiles.length} files`);
  }

  if (architectureSignals.length > 0) {
    return {
      classification: 'architecture',
      architectureSignals,
      reviewSignals: [],
      counts: { changed: websiteFiles.length, added, removed, modified },
    };
  }

  const reviewSignals = [];
  if (websiteFiles.length > 25) {
    reviewSignals.push(`broad website change: ${websiteFiles.length} files`);
  }

  if (websiteFiles.some((file) => file.path === 'website/astro.config.mjs')) {
    reviewSignals.push('Astro configuration changed');
  }

  const baseDependencies = dependencyMap(basePackage);
  const headDependencies = dependencyMap(headPackage);
  const allDependencies = new Set([...baseDependencies.keys(), ...headDependencies.keys()]);
  const nonFrameworkShapeChanges = [...allDependencies].filter((dependency) => {
    if (ARCHITECTURE_DEPENDENCIES.includes(dependency)) return false;
    return baseDependencies.has(dependency) !== headDependencies.has(dependency);
  });

  if (nonFrameworkShapeChanges.length > 0) {
    reviewSignals.push(`dependency shape changed: ${nonFrameworkShapeChanges.join(', ')}`);
  }

  return {
    classification: reviewSignals.length > 0 ? 'review' : 'routine',
    architectureSignals: [],
    reviewSignals,
    counts: { changed: websiteFiles.length, added, removed, modified },
  };
}
