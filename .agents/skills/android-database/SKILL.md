---
name: android-database
description: Room database setup, migrations, relationships, and data access patterns. Includes DataStore and SqlDelight guidance.
metadata:
  orchestration:
    category: implementation
    triggers:
      task_types: ["code-generation", "refactoring"]
      content_patterns: ["Room", "database", "migration", "@Entity", "@Dao", "DataStore", "SqlDelight"]
    priority: 70
    scope: module
---

# Android Database

Use this skill when working with persistence layers in Android.

## Room
- Define entities with `@Entity`, DAOs with `@Dao`, and the database with `@Database`.
- Use `suspend` functions in DAOs for coroutine integration.
- Provide explicit migrations with `Migration(startVersion, endVersion)`.
- Export schema with `exportSchema = true` for CI validation.

## Migrations
- Never drop tables without backup strategy in production.
- Use `ALTER TABLE` for additive changes (new columns, indexes).
- Test migrations on actual user database dumps.

## DataStore
- Use DataStore for typed key-value preferences (replacing SharedPreferences).
- Use `preferencesDataStore` delegate; never instantiate manually.
- Combine with protobuf for complex typed storage.

## SqlDelight (KMP)
- Use SqlDelight for multiplatform SQL with type safety.
- Keep `.sq` files in `commonMain`.
- Generate interfaces with ` queries { ... }` blocks.
