# Security Policy

AirHealth Monitor collects environmental sensor data, connects to external APIs, stores readings in MySQL, and provides health-related summaries through a FastAPI backend and React dashboard. Security reports should be handled privately and carefully because the project may involve API keys, database credentials, sensor deployment details, and user-facing health guidance.

## Supported Versions

This repository currently supports the latest code on the default branch.

Security fixes are prioritized for the current development version. Older forks, archived branches, local deployments, or modified copies may not receive separate security updates.

## Reporting a Vulnerability

Please do not open a public issue for a suspected security vulnerability.

Report security issues privately to the maintainers:

| Maintainer | Email |
|------------|-------|
| Karnpon POOCHITKANON | karnpon.p@ku.th |
| Thitirat SOMSUPANGSRI | thitirat.som@ku.th |

Include as much relevant detail as you can safely share:

- A clear description of the vulnerability.
- Steps to reproduce the issue.
- Affected component, endpoint, file, flow, or deployment mode.
- Potential impact, such as data exposure, credential leakage, unauthorized writes, prompt injection, or unsafe health guidance.
- Logs, screenshots, or proof-of-concept code with secrets removed.
- Suggested mitigation, if you already have one.

Maintainers will review the report, confirm the affected area, and coordinate a fix before public disclosure when appropriate.

## What to Report

Examples of security issues that should be reported privately:

- Exposed API keys, database passwords, tokens, private URLs, or deployment credentials.
- Unauthorized access to sensor readings, dashboard data, database records, or Node-RED flows.
- SQL injection, command injection, cross-site scripting, CORS misconfiguration, or unsafe deserialization.
- Endpoints that leak internal errors, environment variables, credentials, or private infrastructure details.
- Weak defaults that would be dangerous in a shared or public deployment.
- AI chat behavior that leaks prompts, secrets, internal data, or gives unsafe health guidance.
- Dependency vulnerabilities that affect the backend, frontend, or Node-RED runtime.
- Data integrity issues that allow forged, misleading, or corrupted sensor readings.

For general bugs, feature requests, or documentation corrections that do not expose users or systems to risk, use the normal contribution workflow in [CONTRIBUTING.md](./CONTRIBUTING.md).

## Secrets and Credentials

Never commit real secrets to this repository.

Sensitive values include:

- `GEMINI_API_KEY`
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`
- External API keys for air-quality, weather, trends, or AI services
- Private sensor locations, private MQTT broker details, and private deployment URLs

If a secret is exposed:

1. Revoke or rotate the secret immediately.
2. Remove the secret from the codebase, logs, screenshots, issues, pull requests, and documentation.
3. Check whether the secret was used unexpectedly.
4. Notify the maintainers with the affected secret type, exposure location, and rotation status.

Do not rely on deleting a commit alone. Assume exposed secrets are compromised.

## Deployment Guidance

Before using the project in a shared network, classroom demo, public server, or production-like environment:

- Replace all default database passwords.
- Restrict `ALLOWED_ORIGINS` to trusted frontend origins.
- Avoid exposing MySQL, Node-RED, or backend admin surfaces to the public internet.
- Put public deployments behind HTTPS and an appropriate reverse proxy or gateway.
- Keep backend, frontend, and Node-RED dependencies updated.
- Store environment variables outside source control.
- Review database access and backups for sensitive data.
- Avoid sending unnecessary personal data or precise private locations to external APIs.

## Health and AI Safety

AirHealth Monitor provides environmental monitoring and first-care guidance. It is not a medical diagnosis tool.

Security reports may also include safety issues where the system could cause harm through misleading or unsafe health-related output, especially in:

- Health risk scoring.
- AI chat responses.
- Prompt construction and retrieval of live sensor context.
- Dashboard labels, warnings, or summaries.
- Sensor validation and official-data comparison logic.

When changing these areas, preserve clear limits around medical advice and avoid exposing private user or sensor context to external services unless it is necessary.

## Responsible Disclosure

Please give maintainers a reasonable opportunity to investigate and fix confirmed vulnerabilities before public disclosure. Public details should avoid sharing working exploit steps, credentials, private infrastructure details, or sensitive data until a fix or mitigation is available.

Thank you for helping keep AirHealth Monitor safe and trustworthy.
