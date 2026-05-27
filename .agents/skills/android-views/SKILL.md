---
name: android-views
description: Best practices for legacy Android Views (XML layouts, ViewBinding, DataBinding, RecyclerView, and custom views).
metadata:
  orchestration:
    category: implementation
    triggers:
      task_types: ["code-generation", "refactoring"]
      file_patterns: ["*.xml", "*.kt"]
      content_patterns: ["RecyclerView", "ViewBinding", "DataBinding", "LinearLayout", "ConstraintLayout", "Fragment", "Activity"]
    priority: 70
    scope: module
    conflicts_with: ["android-compose"]
---

# Android Views

Use this skill when working with legacy Android Views, XML layouts, or ViewBinding.

## Layout Guidelines
- Prefer ConstraintLayout for complex hierarchies to flatten view depth.
- Use `<include>` for reusable layout pieces.
- Extract dimensions to `res/values/dimens.xml`.

## ViewBinding
- Enable in module `build.gradle.kts` with `viewBinding { enable = true }`.
- Use in Fragments with nullable backing field and cleanup in `onDestroyView`.
- Never mix ViewBinding with synthetic imports.

## RecyclerView
- Use DiffUtil with ListAdapter for automatic animations.
- Keep ViewHolder lightweight; defer image loading to Coil or Glide.
- Avoid notifyDataSetChanged unless absolutely necessary.

## Lifecycle
- Always observe LiveData with `viewLifecycleOwner` in Fragments.
- Post UI updates to the main thread only.
