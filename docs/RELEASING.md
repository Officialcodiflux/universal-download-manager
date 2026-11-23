# Release checklist

Public source and public binaries are separate release steps. Do not publish a
download asset just because a local package command succeeds.

1. Run `npm ci` and `npm test` on Windows x64.
2. Review the source diff and export for private data and proprietary material.
3. Verify third-party license notices and provide corresponding source and build
   material for the actual bundled GPL binaries (including their linked components).
   The FFmpeg commit alone is not a complete source bundle for its external libraries.
   Mirror required source archives alongside binary release assets. Record hashes.
   Review the yt-dlp executable's bundled components too if it is included.
4. `npm run dist` builds an unsigned per-user NSIS installer. Test it on a clean
   Windows machine without Node.js: install, launch, extension setup, native handoff,
   download with audio, completion, update, and uninstall.
5. Attach every file from one **Build Windows release candidate** run to the
   GitHub release: `UDM-Setup.exe`, `UDM-Setup.exe.blockmap`, `latest.yml`,
   `SHA256SUMS.txt` and `UDM-Extension-<version>.zip`. Installed apps find
   updates through `latest.yml`; it must come from the same run as the installer.
6. Publish a **prerelease** until the clean-machine checks and known limitations
   are documented. Attach installer, checksums, notices, and required source assets.
7. Never attach research, browser profiles, diagnostics with media URLs, or user data.
8. Enable repository Issues and private vulnerability reporting. Review incoming
   pull requests; contributors do not need write/admin access to submit them.

Current gates: GitHub authentication, dependency source-distribution audit,
clean-machine installer QA, and first release publication. Code signing and browser
store publication are not configured. Do not advertise them as available.
