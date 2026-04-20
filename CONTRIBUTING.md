# Contributing to AirHealth Monitor

Thank you for helping improve AirHealth Monitor. This guide covers contribution workflow, coding expectations, and submission standards.

## Project Scope

AirHealth Monitor combines sensor readings, external air-quality data, weather data, Google Trends signals, dashboards, visualizations, and AI-assisted first-care guidance.

When contributing, prioritize:

- Accurate environmental data handling.
- Clear, readable dashboards.
- Practical health-risk communication.
- User safety and privacy.
- Maintainable code that follows existing project patterns.

## Code of Conduct

All contributors are expected to follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

## Before You Start

Use the local setup documented in [README.md](./README.md).

Before you open a pull request:

- Make sure the app still runs locally.
- Do not commit real API keys, database passwords, tokens, or private deployment details.
- Keep changes focused on one problem or feature.

## Running Tests

Run all backend tests:

```bash
pytest backend/tests
```

Run a single test file:

```bash
pytest backend/tests/test_ai_chat.py
```

Build the frontend:

```bash
cd frontend
npm run build
```

Before opening a pull request, run the relevant tests for your change. If you cannot run a check, mention why in the PR description.

## Making Changes

### Backend Guidelines

- Keep routers focused and consistent with the existing FastAPI style.
- Add or update Pydantic models in `backend/app/models.py` when response/request schemas change.
- Use dependency injection for database access.
- Avoid live network calls in tests. Mock external APIs such as Gemini, Google Trends, weather, or air-quality services.
- Return clear HTTP errors without exposing secrets.
- Keep seed/demo-only logic out of production routes unless there is a clear maintenance need.

### Frontend Guidelines

- Follow existing React component patterns.
- Keep UI responsive across desktop and mobile.
- Use clear labels, accessible controls, and readable visual hierarchy.
- Avoid adding large dependencies unless they are clearly needed.
- Build the actual user workflow, not only decorative screens.

### Health and AI Guidance

Features that mention symptoms, risk, or first-care guidance must be careful and practical.

- Do not present the app as a medical diagnosis tool.
- Include appropriate caution for severe symptoms.
- Keep AI prompts focused on PM2.5, air pollution exposure, cough, headache, throat irritation, and basic care.
- Protect user privacy and avoid sending unnecessary personal data to external services.

## Pull Requests

Pull requests should include:

- A short summary of what changed.
- Why the change was needed.
- Any API, schema, or environment variable changes.
- Screenshots for UI changes when relevant.
- Notes about tests run, or why tests were not run.

## Commit Messages

Use Conventional Commits:

```text
feat: add AI chat endpoint
fix: handle Gemini quota errors
docs: update API documentation
test: add AI chat endpoint tests
refactor: simplify dashboard state handling
chore: update dependencies
```

Common prefixes:

| Prefix | Use for |
|--------|---------|
| `feat:` | New features |
| `fix:` | Bug fixes |
| `docs:` | Documentation |
| `test:` | Tests |
| `refactor:` | Code restructuring without behavior changes |
| `chore:` | Maintenance |

## Reporting Bugs

When reporting a bug, include:

- What you expected to happen.
- What actually happened.
- Steps to reproduce.
- Relevant URL or endpoint.
- Browser, OS, or environment details when useful.
- Logs or screenshots if they help explain the issue.

Avoid sharing secrets in issue reports.

## Questions?

For questions about contributing, setup, API behavior, or project direction, contact Team 11: Honey.

| Name | Student ID | Email |
|------|------------|-------|
| Karnpon POOCHITKANON | 6710545458 | karnpon.p@ku.th |
| Thitirat SOMSUPANGSRI | 6710545563 | thitirat.som@ku.th |

Repository:

- `https://github.com/honey-airhealth/airhealth-monitor.git`
