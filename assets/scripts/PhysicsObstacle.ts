import {
  _decorator,
  CCBoolean,
  CCFloat,
  Collider2D,
  Component,
  Contact2DType,
  Enum,
  Node,
  PhysicsSystem2D,
  Quat,
  RigidBody2D,
  Tween,
  tween,
  Vec2,
  Vec3,
} from "cc";
import { AudioController, ObstacleSound } from "./AudioController";
import { EventSystem, GameEvent } from "./EventSystem";
import { ShieldController } from "./ShieldController";

const { ccclass, property } = _decorator;
const GRAVITY_SCALE = 5;
const DOWNWARD_GRAVITY = new Vec2(0, -320);

@ccclass("PhysicsObstacle")
export class PhysicsObstacle extends Component {
  @property(CCFloat) public lifetime = 15;
  @property(CCBoolean) public endsGameOnHit = false;
  @property({ type: Enum(ObstacleSound) }) public collisionSound = ObstacleSound.Base;
  @property(CCFloat) public collisionSoundCooldown = 0.5;

  private rigidBody: RigidBody2D = null!;
  private collider: Collider2D = null!;
  private falling = false;
  private expirationTween: Tween<Node> | null = null;
  private initialScale: Vec3 = null!;
  private initialPosition: Vec3 = null!;
  private initialRotation: Quat = null!;
  private collisionSoundEnabled = true;

  public onLoad(): void {
    this.initialScale = this.node.scale.clone();
    this.initialPosition = this.node.position.clone();
    this.initialRotation = this.node.rotation.clone();
    this.rigidBody = this.getComponent(RigidBody2D)!;
    this.collider = this.getComponent(Collider2D)!;
    this.rigidBody.bullet = true;
    this.rigidBody.enabledContactListener = true;
    PhysicsSystem2D.instance.gravity = DOWNWARD_GRAVITY;
    this.stopMoving();
  }

  public onEnable(): void {
    this.collider.on(Contact2DType.BEGIN_CONTACT, this.startFalling, this);
    EventSystem.on(GameEvent.Start, this.activate, this);
    EventSystem.on(GameEvent.Restart, this.stopMoving, this);
    EventSystem.on(GameEvent.End, this.deactivate, this);
  }

  public onDisable(): void {
    this.collider.off(Contact2DType.BEGIN_CONTACT, this.startFalling, this);
    EventSystem.off(GameEvent.Start, this.activate, this);
    EventSystem.off(GameEvent.Restart, this.stopMoving, this);
    EventSystem.off(GameEvent.End, this.deactivate, this);
    this.expirationTween?.stop();
    this.unschedule(this.enableCollisionSound);
  }

  public stopMoving(): void {
    this.falling = false;
    this.collisionSoundEnabled = true;
    this.unschedule(this.enableCollisionSound);
    this.unschedule(this.beginFalling);
    this.unschedule(this.expire);
    this.expirationTween?.stop();
    this.expirationTween = null;
    this.node.setPosition(this.initialPosition);
    this.node.setRotation(this.initialRotation);
    this.node.setScale(this.initialScale);
    this.collider.enabled = false;
    this.rigidBody.enabled = false;
    this.rigidBody.gravityScale = 0;
    this.rigidBody.linearVelocity = Vec2.ZERO;
    this.rigidBody.angularVelocity = 0;
  }

  private activate(): void {
    this.rigidBody.enabled = true;
    this.rigidBody.wakeUp();
    this.collider.enabled = true;
  }

  private deactivate(): void {
    this.collider.enabled = false;
  }

  private startFalling(_: Collider2D, other: Collider2D): void {
    const shield = other.getComponent(ShieldController);
    const obstacle = other.getComponent(PhysicsObstacle);
    if (!shield && !obstacle) {
      return;
    }

    if (shield && this.collisionSoundEnabled) {
      AudioController.instance.playObstacle(this.collisionSound);
      this.collisionSoundEnabled = false;
      this.scheduleOnce(this.enableCollisionSound, this.collisionSoundCooldown);
    }
    if (this.falling) {
      return;
    }

    this.falling = true;
    this.scheduleOnce(this.beginFalling);
  }

  private enableCollisionSound(): void {
    this.collisionSoundEnabled = true;
  }

  private beginFalling(): void {
    this.rigidBody.linearVelocity = Vec2.ZERO;
    this.rigidBody.angularVelocity = 0;
    this.rigidBody.gravityScale = GRAVITY_SCALE;
    this.rigidBody.wakeUp();
    this.scheduleOnce(this.expire, this.lifetime);
  }

  public expire(): void {
    this.rigidBody.enabled = false;
    this.collider.enabled = false;
    this.expirationTween = tween(this.node)
      .to(0.2, { scale: Vec3.ZERO })
      .start();
  }
}
