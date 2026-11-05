#!/runtime/node --max-old-space-size=32
// DO_NOT_COPY: owned lifecycle observability only; this is deliberately inert.
import fs from 'node:fs';
if (process.argv.length !== 4 || process.argv[2] !== '-c' || process.argv[3] !== '/lifecycle-observer.mjs') process.exit(74);
fs.writeFileSync('/output/lifecycle-observed.txt', 'owned-lifecycle-observer\n', { flag: 'wx', mode: 0o600 });
process.exit(73);
