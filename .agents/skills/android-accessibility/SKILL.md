---
name: android-accessibility
description: Accessibility checks and improvements: TalkBack, content descriptions, contrast ratios, and keyboard navigation.
metadata:
  orchestration:
    category: analysis
    triggers:
      task_types: ["analysis", "refactoring"]
      content_patterns: ["accessibility", "TalkBack", "contentDescription", "a11y", "contrast", "screen reader"]
    priority: 65
    scope: module
---

# Android Accessibility

Use this skill when auditing or improving accessibility in an Android app.

## Content Descriptions
- Add `contentDescription` to all meaningful UI elements.
- Use `null` for decorative elements to avoid noise in TalkBack.
- Provide `hint` text for editable fields.

## Semantics (Compose)
- Use `Modifier.semantics { ... }` for custom descriptions.
- Mark headings, lists, and live regions appropriately.
- Ensure state changes are announced with `LiveRegion`.

## Color Contrast
- Ensure text contrast ratio >= 4.5:1 (AA) or 7:1 (AAA).
- Use `ColorUtils` to programmatically check contrast.
- Never rely on color alone to convey meaning.

## Keyboard Navigation
- Enable focus traversal with `nextFocusForward`, `nextFocusDown`, etc.
- Support `D-pad` / directional pad navigation.
- Trap focus appropriately in modal dialogs.

## Testing
- Enable TalkBack and verify navigation order.
- Use Accessibility Scanner (Play Store) for quick checks.
- Write Espresso Accessibility tests with `AccessibilityChecks`.
