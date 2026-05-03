---
name: architecture
description: "Apply this skill whenever making structural changes, adding new features, modifying the database schema, adding new modules, or making architectural decisions. Triggers for migration files, model changes, new API endpoints, directory restructuring, event/listener wiring, and system-level refactors. Encodes the post-refactor architecture for the Hotel Reservation System."
license: MIT
metadata:
  author: hotel-rs
---

# Architecture Skill — Hotel Reservation System

System-level rules for the refactored hotel reservation system. Defines the canonical ERD, directory structure, request lifecycle, data flow patterns, and scalability guardrails.

## Stack

- **PHP 8.3**, **Laravel 12**, **Sanctum 4**
- **MySQL** (or MariaDB)
- **React 19** frontend, **React Router DOM** SPA
- **Laravel Mix** build, **SCSS** styling

## Core Principles

1. **Single source of truth**: pricing lives on `room_types.price_per_night` only; room status lives on `rooms.status` enum only
2. **No side effects in controllers**: events + listeners for status sync, activity logging, notifications
3. **Atomic operations**: `DB::transaction()` + `lockForUpdate()` for critical multi-model writes
4. **API Resources over raw responses**: all JSON goes through dedicated Resource classes
5. **Event-driven for side effects, synchronous for user-facing**: use `defer()` for fire-and-forget, jobs only when crash recovery is needed

## Quick Reference

### 1. ERD & Schema → `rules/erd-schema.md`
- Canonical entity relationships
- Column naming, enums, indexes
- Migration conventions

### 2. API Design → `rules/api-design.md`
- RESTful resource naming, nested routes
- Dashboard stats endpoint
- Filtering, sorting, pagination

### 3. Directory Structure → `rules/directory-structure.md`
- Where each file type lives (Actions, Events, Enums, Policies, etc.)

### 4. Data Flow → `rules/data-flow.md`
- Request → Middleware → Form Request → Controller → Action → Model → Event → Listener → Resource → Response
- Frontend data flow

### 5. Scalability → `rules/scalability.md`
- Pagination, eager loading, indexes, atomic locks, soft deletes
