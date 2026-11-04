# Candidate Node And Dependency Preparation

Feature slug: `candidate-catalog-parity`. **Input review complete; production qualification OPEN.**
Base `74588869646ef273277d0c30727dcc07a266ad88`; upstream remains
`6c4d33b9cfca967a28bb2962ef4d55e4a384c88c`. No accepted input is changed here.
The successful [inert confinement control](candidate-confinement-inert-route.md) is retained.

## Exact Inputs And Findings

The immutable website manifest SHA-256 is
`05ea07146e068b3a253ae2562f27658222f95a1ae6fcdf48900045abbc84a953`;
lockfile SHA-256 is `a24f9ad4534ea3dbc5f4e3f42292b71d31d46dcf77368e5bb865dd6630ffddbe`.
The lock is v3: 552 package records, including its root; 551 resolved package records.
Root dependency declarations agree with the website manifest. No root/website `.npmrc` exists
in that committed tree; no personal/global configuration or credential store was inspected.

- Required direct `@primer/react-brand@0.72.1-rc.c5f3a3b5` declares Node `>=24.0.0`.
  The previously observed Node 22 does not meet that declaration. This is not an observed build
  failure: npm engines are advisory by default unless strict enforcement is selected.
- The `^20.9.0` declaration belongs to optional Windows-only `@img/sharp-win32-ia32`; it is not
  a Linux runtime conflict. Platform-specific selection still needs actual preparation evidence.
- 495 records use the public npm origin with SHA-512 integrity. Another 56 use a non-default
  package feed with SHA-1 integrity. No request to that feed or credential lookup was made.
  Its access/authentication requirements remain unknown; its URLs are not copied into this record.
- Three records carry install-script flags: required `esbuild@0.28.1` and two optional Darwin
  `fsevents` records. No package script body was executed or presumed safe. Ignoring lifecycle
  scripts does not qualify explicit `npm run build` or prove native/platform tooling works.

Sources: [npm engine declarations](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/),
[npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/),
[ignore-scripts](https://docs.npmjs.com/cli/v11/using-npm/config/#ignore-scripts).

## Read-Only Public Identity Evidence

The web reader could not access the public metadata endpoints; it returned no registry HTTP
status. A separately approval-reviewed normal anonymous HTTP client subsequently succeeded.
It used no authorization/cookie header, contacted only the public registry, bounded redirects,
response sizes, concurrency and time, and fetched no tarballs or package code.

The bulk read returned 55 HTTP-200 version records covering all 56 non-default locked paths.
Each exact name/version and canonical public tarball location passed the metadata checks.
All 56 declared SHA-1 digests matched public `dist.shasum` witnesses. Four independently authored
offline test groups passed before bulk comparison, covering positive SHA-1/SHA-512 cases,
same-algorithm mismatches, incomplete evidence and identity/origin rejection. Every verdict,
including a match, retained acquisition/execution authority as false.

An initial literal comparison of SHA-1 and SHA-512 SRI strings was not comparable evidence,
not a content mismatch. That preliminary receipt remains retained with its interpretation.
The algorithm-aware checks distinguish `LEGACY_SHA1_METADATA_MATCH` from stronger SHA-512
metadata equality. Neither establishes actual archive bytes or collision-resistant equivalence
to an unobserved feed archive. No package archive was downloaded, unpacked, installed or executed.

An isolated **PROPOSED / NOT ADOPTED** lock transformation replaces only the 56 `resolved` and
56 `integrity` values with public metadata locations and SHA-512 declarations. All other parsed
JSON values, versions, dependency graph, engines and platforms remain unchanged; serialization
may differ. Proposal SHA-256:
`af8096a63416dd247edde33d501caffe8e7abdd1e28a9fea521b9bb3fc5e5685`.
It remains operational review evidence outside accepted source/configuration. Real archive
verification and review are required before any acquisition/preparation authority follows.

## Cache-Only Node 24 Inert Control — Contract And Reached Result

Question: is an already-installed, recognized Node 24 available on the existing CI route, and can
it perform an owned built-in filesystem/crypto operation without installation or package loading?

The temporary control uses the existing `quality.local` PR job, exact experiment branch and first
run attempt. It does not change the existing setup-node selection or permissions. Inspect only
the declared hosted tool cache; choose the highest stable cached 24.x.y and require its complete
marker, regular binary/header/npm-manifest paths inside that cache, matching version header,
x64 ELF metadata and recorded hashes. Missing/unsupported cache data stops without installation,
download, alternate runtime or fallback. Reading npm package metadata does not invoke npm.

The independently authored probe imports only Node built-ins and operates in a newly owned
temporary directory. The child has fixed environment/arguments, no NODE_OPTIONS, no project
dependency/config imports, no network calls, no credential probes and a five-second limit.
It checks version, identity, owned write/read/hash/remove behavior and reports only nonsecret
metadata. Cleanup and source preservation are required. The hook is retired before final merge.
Code review and a separate prospective admission precede publication that can execute it.

This is a host-runtime availability control, **not a Node-container or dependency test**.
The earlier runner bootstrap image version and `ImageVersion` environment value differ; keep
those observations separately attributed and do not infer tool-cache contents from either alone.

## Disposition And Remaining Gates

The declared engine floor and origin/integrity inventory are source-backed; public metadata
consistency is observed. Actual tarball bytes, a selected runtime inside the restricted child,
platform/native dependency preparation, scripts/build behavior and post-merge execution remain
unqualified. Do not silently use Node 22, rewrite the accepted lock, authenticate to the feed,
install a runtime, execute upstream code or weaken the successful confinement boundary.

`SOURCE_SPECIFIED / ALIGNED`: preserve original inputs and prior successful/failed evidence.
`DERIVED_NO_ARCHITECTURE_CHANGE / ALIGNED`: do not call different digest algorithms a mismatch,
do not apply Windows optional constraints to Linux, and do not infer archive identity from metadata.
`IMPLEMENTATION_DETAIL / NEW_ARCHITECTURAL_DECISION`: the public-only lock proposal and production
runtime/preparation method need review before adoption. A cached-runtime inert observation cannot
grant that authority. No image pull, new VM, security-setting change, measured benefit or whole
Mission 9/10 acceptance follows from this assessment.

## Independent Prepublication Review

Result: PASS for source candidate `94f0dc8c4bac4c576007079c2fc8510b1dc6f2bf` and the bounded cache-only inert
host control. Actual cached Node 24 availability and operation remain NOT_EXECUTED at this review.

Reviewed the wrapper, independently authored probe, temporary existing-job hook, input assessment,
metadata-attribution note and PR explanation. Probe/wrapper/workflow hashes match the separate
prospective control admission. The wrapper selects only a stable complete cache entry, bounds and
checks resolved regular-file inputs, matches its version header and x64 ELF metadata, records hashes,
and reads npm metadata as JSON without invoking npm. Its one child runs only the fixed built-in
probe with an explicit environment, owned cwd and five-second timeout. Source snapshots and owned
cleanup gate success; failures retain a nonzero receipt. There is no installer, acquisition,
package/config import, Docker command or fallback. PR/branch/first-attempt selectors exclude push
and main execution; retire the temporary hook after the admitted observation and before final merge.

The metadata review correctly separates algorithm-aware SHA-1 witnesses from archive-byte proof
and keeps the public-lock proposal unadopted. Node 24's availability control does not qualify a
container, dependencies, scripts, build behavior or pre/post-merge production execution. Runner
bootstrap labels and environment metadata remain separately attributed; the prior inert C result
is not reclassified or used to infer cache contents. No blocking finding remains in this preparation.

This reviewer ran no runtime, tests, package commands, network calls or actual-route control.
Preserve the original metadata freeze, separate admission, active time/resource stops and first
result. Bind the final source revision after this review-only addition before publication.


## Actual Cached-Runtime Observation — 2026-11-04

The first admitted [PR control run 41810915781](https://github.com/jnicholas000/basic-plugin/actions/runs/41810915781/job/126509636991)
passed. Source head was `16b861a1becef7838aa77a1193125cf936c7484e`; the actual checkout/test-merge
commit was `e8be4b875fd5a317003a25a33322397921516fde`. Push-event control steps were excluded
by the hook's condition. No retry, alternate runtime or installation was used by the control.
The hook is retired before further publication.

- Existing cached Node: `24.22.1`, Linux x64; binary SHA-256
  `e32e2d16081cf644f88392934288086e7662529d0d43277c34f7aad2207cfafb`.
  Directory, complete marker, version header and x64 ELF metadata were checked before execution.
- Read-only bundled npm manifest: version `11.19.1`, declared Node engine
  `^20.17.0 || >=22.9.0`; npm itself was not invoked.
- The fixed built-in-module probe ran as UID/GID 1001/1001 with only the four declared environment
  keys. Its owned write/read/SHA-512/remove assertions passed; all 113 tracked source files stayed
  unchanged and owned temporary-file cleanup completed.
- Receipt raw-file checksum:
  `18bf606f83d8920716c1ba73a326285d7e44042bbf49545e25048bc67d2632ae`.
  The exact log-carried JSON plus LF matches it and binds probe
  `25c8163316789c4501a85781d154c1152fbd284f885a3e3dfd4c371e92f30a3a` and wrapper
  `9632b41b9a176c8bb49c0d84b40a0243f6c283430ea4c9c3f2f321fc0597ac2e`.

This proves that an existing cached runtime meets the required direct dependency's stated major
version floor and performs the owned built-in host operation. It is not complete engine/platform
compatibility, artifact-byte verification, dependency installation, Node-in-container qualification
or post-merge candidate execution evidence. The operational duration is not a benefit metric.
The observed runtime identity does not depend on treating runner image labels as attestations.

### Updated Next Boundary

No new Node installation is indicated by this observation. Next stage the declared public package
archives as inert data under explicit byte/time/source limits, verify their actual bytes, and review
the candidate-only lock proposal. Separately qualify the recorded existing Node/npm and required
runtime files inside the restricted child, with scripts disabled during dependency preparation.
Do not merge those separate observations into a production-ready claim. Actual package/build
execution, native/platform behavior and both pre/post-merge paths retain their own required review
and per-action authority. No accepted lock, production output or baseline changed here.
