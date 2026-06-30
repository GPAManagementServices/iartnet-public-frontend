# Security Policy

## Supported Versions

We release security updates for the current major version. Check [releases](https://github.com/GPAManagementServices/iartnet_frontend/releases) for supported versions.

## Reporting a Vulnerability

**Do not** open a public issue for security vulnerabilities.

Please report security issues by contacting the maintainers privately. If you have a GitHub account, you can use [Security Advisories](https://github.com/GPAManagementServices/iartnet_frontend/security/advisories/new) for this repository ( **Security** → **Advisories** → **Report a vulnerability** ).

Alternatively, describe the issue in a private way to the project owners (e.g. via the organization contact). Include steps to reproduce and impact where possible.

We will acknowledge receipt and work with you on a fix and disclosure timeline.

## Best practices

- Do not commit secrets, API keys, or `.env` files (use `.env.example` as a template only).
- Dependencies are managed with pnpm; run `pnpm install` only from trusted lockfile and update dependencies with care.
