# Cocos project contract

## Purpose

Small Cocos Creator projects: the user owns visual Editor work and preview-analytics validation; agents implement code and focused wiring recovery.

## Architecture

- A code-free project may use `assets/Cocos_Engine/`, `assets/Art/`, `assets/Prefabs/`, and `assets/Code/{Gameplay,UI,Infrastructure}/`.
- Existing-code projects retain their structure unless the user approves a refactor or rewrite.
- Create scripts only when the current feature needs them.
- Shared services/managers may use singleton or static access; keep object-local behavior in components.
- `GameController` owns normal flow. Scenario and tutorial controllers are optional. `UIController` mediates UI; screens/elements are separate components.

## References and Editor work

- Use serialized properties and arrays unless the task provides another explicit reference source. Never discover nodes/components by name, path, child index, or hierarchy/component search; typed `getComponent` on a known node is allowed.
- The user assigns Editor references. After a reported wiring error, MCP may assign an existing unambiguous component property; otherwise provide manual steps.
- Never inspect images unless explicitly requested.

## Verification

- Never create test files or test scripts unless the user explicitly requests them.
- Never build or export a playable.
- TypeScript verification is currently unavailable: the exported project has no recorded compatible check; `npx tsc --noEmit -p tsconfig.json` uses TypeScript 6 and fails before checking sources because Cocos 3.8 generates `moduleResolution=node10`.
- The user validates through preview analytics.
