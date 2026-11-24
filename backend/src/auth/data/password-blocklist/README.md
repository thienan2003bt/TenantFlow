# Bundled password blocklist

This directory contains public common-password data, not real user credentials. PasswordBlocklistService reads and verifies the two required text files once during provider construction. Missing, unreadable or checksum-mismatched files prevent construction. Checks compare the entire string exactly; they never trim, lowercase, normalize or send submitted passwords over the network.

- [10k-most-common.txt](10k-most-common.txt): byte-for-byte SecLists snapshot at commit `fcde9140df969b1e4d7bb056122646dace4ed4cc`. The upstream filename says 10k, but this snapshot has 10001 nonempty entries (10001 unique). Keep the original bytes and filename.
- [additional-passwords.txt](additional-passwords.txt): separately maintained common/context-specific weak-password examples. These are not individually certified breach records; reviewed known-compromised entries can also be added here. A character-class-compliant password can still be blocked.
- [metadata.json](metadata.json): source commit/URL, Git blob identity, SHA-256, counts, license provenance and review dates.
- [LICENSE-SecLists.txt](LICENSE-SecLists.txt): exact upstream MIT license from the same pinned commit. Preserve it with any redistributed copy of the SecLists data. Additional entries are TenantFlow policy data.

## Runtime and build

Nest's `compilerOptions.assets` copies this directory from `src/auth/data/password-blocklist/` to `dist/auth/data/password-blocklist/`. The service uses `new URL(..., import.meta.url)`, so source and compiled loading work without relying on the shell's working directory. Restart the provider after a reviewed update; request handling does not reload files.

The service pins SHA-256 values independently in source. The UTF-8/LF files use one exact password per line. Do not trim entries or add comments to the text files. Empty separator lines are ignored; spaces within nonempty lines remain significant. This baseline is not comprehensive breach screening. Invoke it after structural parsing on registration/password replacement; login must not block existing credentials merely because they are now listed.

## Monthly review and update

Next review: **24 December 2026**. Review updates monthly, not during application startup.

1. Select and inspect a specific SecLists commit. Obtain the list and license from that exact commit and verify their Git blob identities; never use a moving branch URL as the recorded pin.
2. Preserve the downloaded bytes. Compute SHA-256 for both password assets, update the expected service digests and metadata, and maintain the license/provenance. Review additions to the separate project list.
3. Update reviewedOn and nextReviewDue, then run `npm.cmd run check`. Its final compiled smoke checks byte-for-byte asset copying and loading from another working directory. `npm.cmd run test:blocklist:build` runs that build check separately.

The accepted input/API policy remains in [backend requirements](../../../../../docs/requirements/BACKEND_REQUIREMENTS.md#accepted-initial-session-auth-contract); general commands remain in the [backend README](../../../../README.md).
