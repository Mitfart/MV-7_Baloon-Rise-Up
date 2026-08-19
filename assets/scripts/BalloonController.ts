import {
  _decorator,
  AnimationComponent,
  Camera,
  CCFloat,
  Collider2D,
  Component,
  Contact2DType,
  ERigidBody2DType,
  Label,
  Node,
  RigidBody2D,
  Vec2,
  Vec3,
} from "cc";
import superHtml, { PlayableAnalyticsEvent } from "../Cocos_Engine/General/Code/export/super_html_playable";
import { AnimUtils } from "./AnimUtils";
import { AudioController } from "./AudioController";
import { EventSystem, GameEvent } from "./EventSystem";
import { GameManager } from "./GameManager";
import { Checkpoint } from "./Checkpoint";

const { ccclass, property } = _decorator;
const CHECKPOINT_GROUP = 1 << 9;

@ccclass("BalloonController")
export class BalloonController extends Component {
  public static instance: BalloonController;

  @property(Collider2D) public winBarrier: Collider2D = null!;
  @property(Node) public visual: Node = null!;
  @property(Camera) public camera: Camera = null!;
  @property(Label) public meter: Label = null!;
  @property(CCFloat) public speed = 350;
  @property(CCFloat) public slowSpeed = 150;
  @property(CCFloat) public speedEaseDuration = 4;

  private rigidBody: RigidBody2D = null!;
  private collider: Collider2D = null!;
  private initialPosition: Vec3 = null!;
  private respawnWorldPosition: Vec3 | null = null;
  private initialWorldY = 0;
  private initialCameraY = 0;
  private moving = false;
  private openingFinished = false;
  private passed25Percent = false;
  private passed50Percent = false;
  private passed75Percent = false;
  private currentSpeed = 0;
  private speedEaseElapsed = 0;
  private speedEaseFrom = 0;
  private speedEaseTo = 0;
  private ended = false;

  public onLoad(): void {
    BalloonController.instance = this;
    this.rigidBody = this.getComponent(RigidBody2D)!;
    this.collider = this.getComponent(Collider2D)!;
    this.rigidBody.type = ERigidBody2DType.Animated;
    this.collider.enabled = false;
    this.initialPosition = this.node.position.clone();
    this.initialWorldY = this.node.worldPosition.y;
    this.initialCameraY = this.camera.node.position.y;
    this.currentSpeed = this.slowSpeed;
    this.speedEaseFrom = this.slowSpeed;
    this.speedEaseTo = this.slowSpeed;
  }

  public onEnable(): void {
    this.collider.on(
      Contact2DType.BEGIN_CONTACT,
      this.onBeginContact,
      this,
    );
    EventSystem.on(GameEvent.Start, this.startMoving, this);
    EventSystem.on(GameEvent.Start, this.startAnimation, this);
    EventSystem.on(GameEvent.End, this.stopMoving, this);
    EventSystem.on(GameEvent.End, this.hide, this);
    EventSystem.on(GameEvent.Restart, this.onRestart, this);
  }

  public onDisable(): void {
    this.collider.off(
      Contact2DType.BEGIN_CONTACT,
      this.onBeginContact,
      this,
    );
    EventSystem.off(GameEvent.Start, this.startMoving, this);
    EventSystem.off(GameEvent.Start, this.startAnimation, this);
    EventSystem.off(GameEvent.End, this.stopMoving, this);
    EventSystem.off(GameEvent.End, this.hide, this);
    EventSystem.off(GameEvent.Restart, this.onRestart, this);
  }

  public startAnimation(): void {
    this.getComponent(AnimationComponent)!.play("balloonAnimation");
  }

  public stopAnimation(restartAfterSeconds = -1): void {
    this.getComponent(AnimationComponent)!.stop();
    if (restartAfterSeconds >= 0) {
      // The restart delay leaves the blink animation visible before flight resumes.
      this.scheduleOnce(this.startAnimation, restartAfterSeconds);
    }
  }

  public prepareRetry(): void {
    this.node.active = true;
  }

  public setRespawnPosition(position: Vec3): void {
    this.respawnWorldPosition = position.clone();
  }

  public onRestart(): void {
    this.ended = false;
    this.stopMoving();
    this.collider.enabled = false;
    this.rigidBody.enabled = false;
    this.rigidBody.linearVelocity = Vec2.ZERO;
    this.rigidBody.angularVelocity = 0;
    if (this.respawnWorldPosition) {
      this.node.setWorldPosition(this.respawnWorldPosition);
      const cameraPosition = this.camera.node.worldPosition;
      this.camera.node.setWorldPosition(
        cameraPosition.x,
        this.initialCameraY + this.respawnWorldPosition.y - this.initialWorldY,
        cameraPosition.z,
      );
    } else {
      this.node.setPosition(this.initialPosition);
      const cameraPosition = this.camera.node.position;
      this.camera.node.setPosition(cameraPosition.x, this.initialCameraY, cameraPosition.z);
    }
    this.scheduleOnce(() => {
      this.rigidBody.enabled = true;
      this.rigidBody.wakeUp();
    }, 0.1);
    this.blink();
    this.stopAnimation(1);
  }

  public startMoving(): void {
    this.moving = true;
    this.scheduleOnce(this.enableCollider, 0.1);
    if (this.openingFinished) {
      return;
    }

    this.openingFinished = true;
    this.easeToNormalSpeed();
    EventSystem.emit(GameEvent.OpeningCleared);
  }

  public stopMoving(): void {
    this.moving = false;
    this.unschedule(this.enableCollider);
    this.collider.enabled = false;
  }

  public update(deltaTime: number): void {
    if (!this.moving) {
      return;
    }

    this.updateSpeed(deltaTime);
    const position = this.node.position;
    this.node.setPosition(position.x, position.y + this.currentSpeed * deltaTime, position.z);
    const distance = this.node.worldPosition.y - this.initialWorldY;
    this.meter.string = Math.floor(distance / 255).toString();


    this.trackProgressMilestones(distance);
  }


  public lateUpdate(): void {
    const cameraPosition = this.camera.node.position;
    this.camera.node.setPosition(
      cameraPosition.x,
      this.initialCameraY + this.node.worldPosition.y - this.initialWorldY,
      cameraPosition.z,
    );
  }

  private enableCollider(): void {
    this.collider.enabled = true;
  }

  private easeToNormalSpeed(): void {
    this.speedEaseElapsed = 0;
    this.speedEaseFrom = this.currentSpeed;
    this.speedEaseTo = this.speed;
  }

  private updateSpeed(deltaTime: number): void {
    if (this.currentSpeed === this.speedEaseTo) {
      return;
    }
    if (this.speedEaseDuration <= 0) {
      this.currentSpeed = this.speedEaseTo;
      return;
    }

    this.speedEaseElapsed = Math.min(this.speedEaseElapsed + deltaTime, this.speedEaseDuration);
    const progress = this.speedEaseElapsed / this.speedEaseDuration;
    const easedProgress = progress * progress * (3 - 2 * progress);
    this.currentSpeed = this.speedEaseFrom + (this.speedEaseTo - this.speedEaseFrom) * easedProgress;
  }

  private trackProgressMilestones(distance: number): void {
    if (distance >= 3750 && !this.passed25Percent) {
      this.passed25Percent = true;
      superHtml.trackEvent(PlayableAnalyticsEvent.CHALLENGE_PASS_25);
    }
    if (distance >= 7500 && !this.passed50Percent) {
      this.passed50Percent = true;
      superHtml.trackEvent(PlayableAnalyticsEvent.CHALLENGE_PASS_50);
    }
    if (distance >= 11250 && !this.passed75Percent) {
      this.passed75Percent = true;
      superHtml.trackEvent(PlayableAnalyticsEvent.CHALLENGE_PASS_75);
    }
  }

  private onBeginContact(_: Collider2D, other: Collider2D): void {
    if (this.ended) {
      return;
    }

    if (other.group === CHECKPOINT_GROUP) {
      other.getComponent(Checkpoint)?.activate();
      return;
    }

    if (other === this.winBarrier) {
      this.ended = true;
      superHtml.trackEvent(PlayableAnalyticsEvent.CHALLENGE_SOLVED);
      // Cocos forbids changing collider state from inside a contact callback.
      this.scheduleOnce(() => {
        other.node.active = false;
        GameManager.instance.showEndScreen();
      });
      return;
    }

    AudioController.instance.playBalloon();
    this.ended = true;
    // Cocos forbids changing collider state from inside a contact callback.
    this.scheduleOnce(() => GameManager.instance.onBalloonHit());
  }

  private hide(): void {
    this.node.active = false;
  }

  private blink(): void {
    AnimUtils.animateOpacity(this.visual, 255, 0.1);
    // Repeating the short blink three times communicates a retry before restart.
    this.schedule(
      () => {
        AnimUtils.animateOpacity(this.visual, 150, 0.1, () => {
          AnimUtils.animateOpacity(this.visual, 255, 0.1);
        });
      },
      0.2,
      3,
      0.1,
    );
  }
}
