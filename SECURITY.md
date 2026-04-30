# Security policy

## Reporting a vulnerability

If you believe you have found a security vulnerability in Asmaa, do **not** open a public issue. Instead, contact the maintainer directly:

- Email: aamsdoumani@gmail.com
- Subject line: `Asmaa security report`

Please include:

- A description of the issue
- The affected file or behavior
- Steps to reproduce
- The browser, operating system, and Asmaa version (commit SHA)
- Any proof-of-concept code, request payloads, or screenshots that help reproduce
- Your name or handle if you would like attribution after the fix lands

## What to expect

- An acknowledgment within 7 days
- A timeline for triage and remediation in the response
- A coordinated disclosure date once a fix is ready

If a report turns out not to be a vulnerability, you will receive an explanation of why and a thank-you for the time invested.

## Scope

In scope:

- The deployed web application at the live demo URL listed in [README.md](README.md)
- The source files in this repository: `index.html`, `404.html`, `script.js`, `styles.css`, `names.js`, `vercel.json`
- Cross-origin and CSP-related issues
- Stored or reflected XSS, CSRF, clickjacking, and similar client-side issues
- localStorage handling and shape validation
- Issues introduced by Google Fonts loading from `fonts.googleapis.com` and `fonts.gstatic.com`

Out of scope:

- Vulnerabilities in third-party services that Asmaa does not control (Vercel platform, Google Fonts CDN)
- Social engineering of the maintainer
- Denial of service against a static site (the app is fully static)
- Issues that require physical access to a victim's device or pre-existing malware
- Issues only reproducible on browsers that are no longer maintained by their vendor

## Hardening already in place

The deployed app sets the following response headers via `vercel.json`:

- `Content-Security-Policy` - strict; `script-src 'self'` only, no inline scripts
- `Strict-Transport-Security` - 2-year HSTS, `includeSubDomains`, `preload`
- `X-Frame-Options: DENY` and `frame-ancestors 'none'`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` - camera, microphone, geolocation, and FLoC all disabled
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`
- `X-Content-Type-Options: nosniff`

The app has zero runtime dependencies and makes no `fetch`, `XMLHttpRequest`, or `WebSocket` calls.

## Acknowledgments

Researchers who report a valid vulnerability will be credited in [CHANGELOG.md](CHANGELOG.md) under the release that contains the fix, unless they prefer to remain anonymous.
