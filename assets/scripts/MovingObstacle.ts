import { _decorator, CCFloat, Component, Enum, Quat, Vec3 } from "cc";
import { EventSystem, GameEvent } from "./EventSystem";

const { ccclass, property } = _decorator;

enum Direction {
  Left,
  Right,
  BackAndForth,
}

@ccclass("MovingObstacle")
export class MovingObstacle extends Component {
  @property(CCFloat) public speed = 20;
  @property(CCFloat) public time = 0;
  @property({ type: Enum(Direction) }) public direction = Direction.Right;

  private isMoving = false;
  private initialPosition: Vec3 = null!;
  private initialRotation: Quat = null!;
  private initialScale: Vec3 = null!;

  public onLoad(): void {
    this.initialPosition = this.node.position.clone();
    this.initialRotation = this.node.rotation.clone();
    this.initialScale = this.node.scale.clone();
  }

  public onEnable(): void {
    EventSystem.on(GameEvent.Start, this.scheduleMoving, this);
    EventSystem.on(GameEvent.Restart, this.stopMovingWithoutRestart, this);
    EventSystem.on(GameEvent.End, this.stopMovingWithoutRestart, this);
  }

  public onDisable(): void {
    EventSystem.off(GameEvent.Start, this.scheduleMoving, this);
    EventSystem.off(GameEvent.Restart, this.stopMovingWithoutRestart, this);
    EventSystem.off(GameEvent.End, this.stopMovingWithoutRestart, this);
  }

  public update(deltaTime: number): void {
    if (!this.isMoving) {
      return;
    }

    const position = this.node.position;
    const direction = this.direction === Direction.Right ? 1 : -1;
    this.node.setPosition(position.x + deltaTime * this.speed * direction, position.y);
  }

  public stopMoving(): void {
    this.unscheduleAllCallbacks();
    this.isMoving = false;
    this.scheduleOnce(this.startMoving, this.time + 1);
  }

  private scheduleMoving(): void {
    this.scheduleOnce(this.startMoving, this.time);
  }

  private startMoving(): void {
    this.isMoving = true;
  }

  private stopMovingWithoutRestart(): void {
    this.unscheduleAllCallbacks();
    this.isMoving = false;
    this.node.setPosition(this.initialPosition);
    this.node.setRotation(this.initialRotation);
    this.node.setScale(this.initialScale);
  }
}
