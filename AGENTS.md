# ConjuGO project instructions

## Production releases

- Before an authorized push to production `main`, review the changes since the last release tag and follow the release workflow in `README.md`.
- Prepare one new version for the full release. Bump the patch for fixes and small polish, the minor version for new features or substantial content, or the major version for breaking changes.
- Update `package.json` and prepend the matching dated Chinese and English release notes to `src/data/releases.json` before staging the release. Keep the notes focused on what users will notice.
- Run `pnpm test`, `pnpm lint`, and `pnpm build`. Tag the release commit `vX.Y.Z`, push `main` and the tag together, and verify the production version after deployment.
- Local edits and development-only commits can be grouped into a later release.
