import {
  _decorator,
  CircleCollider2D,
  Component,
  ERigidBody2DType,
  EventTouch,
  input,
  Input,
  RigidBody2D,
  UITransform,
  Vec2,
  Vec3,
} from "cc";
import superHtml, { PlayableAnalyticsEvent } from "../Cocos_Engine/General/Code/export/super_html_playable";
import { EventSystem, GameEvent } from "./EventSystem";
import { GameManager } from "./GameManager";

const { ccclass } = _decorator;

@ccclass("ShieldController")
export class ShieldController extends Component {
  public static instance: ShieldController;

  private rigidBody: RigidBody2D = null!;
  private collider: CircleCollider2D = null!;
  private initialPosition: Vec3 = null!;
  private touchPosition = new Vec3();
  private targetPosition = new Vec3();
  private firstClick = true;
  private holding = false;

  public onLoad(): void {
    ShieldController.instance = this;
    this.rigidBody = this.getComponent(RigidBody2D)!;
    this.collider = this.getComponent(CircleCollider2D)!;
    this.initialPosition = this.node.position.clone();
    this.rigidBody.type = ERigidBody2DType.Animated;
  }

  public onEnable(): void {
    input.on(Input.EventType.TOUCH_START, this.onTouch, this);
    input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    EventSystem.on(GameEvent.End, this.hide, this);
    EventSystem.on(GameEvent.Restart, this.reset, this);
  }

  public onDisable(): void {
    input.off(Input.EventType.TOUCH_START, this.onTouch, this);
    input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    EventSystem.off(GameEvent.End, this.hide, this);
    EventSystem.off(GameEvent.Restart, this.reset, this);
  }

  public changeColliderRadius(radius: number): void {
    this.collider.radius = radius;
    this.collider.enabled = false;
    this.collider.enabled = true;
  }

  private reset(): void {
    this.holding = false;
    this.collider.enabled = false;
    this.rigidBody.enabled = false;
    this.rigidBody.linearVelocity = Vec2.ZERO;
    this.rigidBody.angularVelocity = 0;
    this.node.setPosition(this.initialPosition);
    this.scheduleOnce(() => {
      this.rigidBody.enabled = true;
      this.rigidBody.wakeUp();
      this.collider.enabled = true;
    }, 0.1);
  }

  private onTouch(event: EventTouch): void {
    if (this.firstClick) {
      superHtml.trackEvent(PlayableAnalyticsEvent.CHALLENGE_STARTED);
      this.changeColliderRadius(150);
      EventSystem.emit(GameEvent.Start);
      this.firstClick = false;
    }

    this.holding = true;
    this.node.active = true;
    this.moveToTouch(event);
  }

  private onTouchMove(event: EventTouch): void {
    if (!this.holding) {
      return;
    }
    this.moveToTouch(event);
  }

  private onTouchEnd(): void {
    this.holding = false;
  }

  private moveToTouch(event: EventTouch): void {
    const position = event.getUILocation();
    this.touchPosition.set(position.x, position.y, 0);
    this.node.parent!.parent!
      .getComponent(UITransform)!
      .convertToNodeSpaceAR(this.touchPosition, this.targetPosition);
    this.node.setPosition(
      this.targetPosition.x,
      this.targetPosition.y,
      this.node.position.z,
    );
  }

  private hide(): void {
    this.node.active = false;
  }
}
