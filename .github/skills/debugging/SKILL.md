---
name: debugging
description: "Apply this skill whenever encountering errors, unexpected behavior, performance issues, or test failures in the Hotel Reservation System. Triggers for any exception, 5xx/4xx response, slow queries, failing tests, stale data, or frontend rendering issues. References the refactored event-driven architecture and API Resource layer."
license: MIT
metadata:
  author: hotel-rs
---

# Debugging Skill — Hotel Reservation System

Debugging strategies and tooling specific to the Hotel Reservation System's post-refactor architecture.

## Quick Reference

### 1. Backend Debugging → `rules/backend-debugging.md`
- Real-time logs, exceptions, database inspection, query profiling, event/listener registration

### 2. Frontend Debugging → `rules/frontend-debugging.md`
- Browser console, network tab, API response shapes, React Router, token validation

### 3. Common Issues → `rules/common-issues.md`
- Vite manifest, 401s, room status out of sync, CORS, migration failures, column not found, policy unauthorized, resource missing field

### 4. Testing Debug → `rules/testing-debug.md`
- Single test runs, factory setup order, exception handling, response inspection

### 5. Performance → `rules/performance.md`
- Lazy loading prevention, N+1 detection, EXPLAIN plans, query counts, event listener lightweight
