# Rise Up — Balloon Rise Up

[English version](README.md) · [← Портфолио](../README_RU.md)

![Cocos Creator](https://shieldcn.dev/badge/Cocos_Creator-3.8.8-55c2e0.svg)
![Physics](https://shieldcn.dev/badge/Genre-Physics_Arcade-22c55e.svg)

Мобильный playable, в котором игрок двигает щит, чтобы расчищать физические препятствия перед автоматически поднимающимся воздушным шаром.

## Галерея

<table>
<tr>
  <td><img src="images/0_start.png" width="210" alt="Start" /></td>
  <td><img src="images/1_lvl1.png" width="210" alt="Level 1" /></td>
  <td><img src="images/2_lvl2.png" width="210" alt="Level 2" /></td>
  <td><img src="images/3_lvl3.png" width="210" alt="Level 3" /></td>
</tr>
<tr>
  <td><img src="images/4_lvl4.png" width="210" alt="Level 4" /></td>
  <td><img src="images/5_end.png" width="210" alt="End" /></td>
  <td><img src="images/6_end_lose.png" width="210" alt="Fail" /></td>
</tr>
</table>

## Особенности

- Сенсорное управление щитом и физические препятствия.
- Чекпоинты и три жизни для повторных попыток.
- Обучающий UI, звук столкновений, fail-endcard и install CTA.
- Переиспользуемые префабы препятствий, туннелей, UI и шара.

## Ключевые файлы

- `assets/scripts/GameManager.ts` — игровой прогресс.
- `assets/scripts/BalloonController.ts` — поведение шара.
- `assets/scripts/ShieldController.ts` — управление игрока.
- `assets/scripts/PhysicsObstacle.ts` — препятствия.
- `assets/scene.scene` — главная сцена.

## Запуск

Откройте папку в Cocos Creator 3.8.8. Для проверки TypeScript выполните `npx tsc --noEmit`.
