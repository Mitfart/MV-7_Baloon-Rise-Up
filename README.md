# Rise Up — Balloon Rise Up

[← Portfolio](../README.md) · [Русская версия](README_RU.md)

![Cocos Creator](https://shieldcn.dev/badge/Cocos_Creator-3.8.8-55c2e0.svg)
![Physics](https://shieldcn.dev/badge/Genre-Physics_Arcade-22c55e.svg)

A mobile playable in which players move a shield to clear physics obstacles from an automatically rising balloon.

## Gallery

<img src="_images/0_start.png" width="180" alt="Start" />
<img src="_images/1_lvl1.png" width="180" alt="Level 1" />
<img src="_images/2_lvl2.png" width="180" alt="Level 2" />
<img src="_images/3_lvl3.png" width="180" alt="Level 3" />
<img src="_images/4_lvl4.png" width="180" alt="Level 4" />
<img src="_images/5_end.png" width="180" alt="End" />
<img src="_images/6_end_lose.png" width="180" alt="Fail" />

## Highlights

- Touch-controlled shield and physics obstacles.
- Checkpoints and a three-life retry loop.
- Tutorial UI, collision audio, fail endcard, and install CTA.
- Reusable obstacle, tunnel, UI, and balloon prefabs.

## Key files

- `assets/scripts/GameManager.ts` — game progression.
- `assets/scripts/BalloonController.ts` — balloon behavior.
- `assets/scripts/ShieldController.ts` — player control.
- `assets/scripts/PhysicsObstacle.ts` — obstacle behavior.
- `assets/scene.scene` — main scene.

## Run

Open this folder in Cocos Creator 3.8.8. Run `npx tsc --noEmit` to type-check the TypeScript project.
