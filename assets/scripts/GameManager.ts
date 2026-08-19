import {
  _decorator,
  Component,
  Node,
  UIOpacity,
} from "cc";
import { AnimUtils } from "./AnimUtils";
import { EventSystem, GameEvent } from "./EventSystem";
import { ShieldController } from "./ShieldController";
import { BalloonController } from "./BalloonController";
import { FailEndcard } from "./FailEndcard";
import { Lives } from "./Lives";
import superHtml, { PlayableAnalyticsEvent } from "../Cocos_Engine/General/Code/export/super_html_playable";

const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
  public static instance: GameManager;

  @property(Node) public startScreen: Node = null!;
  @property(Node) public endScreen: Node = null!;
  @property(Node) public installButtonGameplay: Node = null!;
  @property(Lives) public livesUI: Lives = null!;

  private lives = 3;
  private checkpointSpawn: Node | null = null;

  public onLoad(): void {
    superHtml.trackEvent(PlayableAnalyticsEvent.LOADING);
    superHtml.trackEvent(PlayableAnalyticsEvent.LOADED);
    GameManager.instance = this;
    this.startScreen.active = true;
    this.endScreen.active = false;
  }

  public onEnable(): void {
    EventSystem.on(GameEvent.OpeningCleared, this.finishOpeningTutorial, this);
  }

  public onDisable(): void {
    EventSystem.off(GameEvent.OpeningCleared, this.finishOpeningTutorial, this);
  }

  public start(): void {
    superHtml.trackEvent(PlayableAnalyticsEvent.DISPLAYED);
    this.livesUI.create(this.lives);
  }

  public onBalloonHit(): void {
    this.lives--;
    this.livesUI.hideLast();
    if (this.lives <= 0) {
      superHtml.trackEvent(PlayableAnalyticsEvent.CHALLENGE_FAILED);
      this.showEndScreen();
      return;
    }

    superHtml.trackEvent(PlayableAnalyticsEvent.CHALLENGE_RETRY);
    EventSystem.emit(GameEvent.End);
    FailEndcard.instance.show();
  }

  public setCheckpoint(spawn: Node): void {
    this.checkpointSpawn = spawn;
  }

  public restartAll(): void {
    FailEndcard.instance.hide();
    this.startScreen.active = false;
    BalloonController.instance.prepareRetry();
    ShieldController.instance.node.active = true;
    if (this.checkpointSpawn) {
      BalloonController.instance.setRespawnPosition(this.checkpointSpawn.worldPosition);
    }
    EventSystem.emit(GameEvent.Restart);
    // Wait for each restartable object's blink and physics reset before flight resumes.
    this.scheduleOnce(() => EventSystem.emit(GameEvent.Start), 1);
  }

  public onInstallButtonClick(): void {
    if (!this.endScreen.active) {
      this.showEndScreen();
    }
    superHtml.download();
  }

  public showEndScreen(): void {
    EventSystem.emit(GameEvent.End);
    this.endScreen.getComponent(UIOpacity)!.opacity = 0;
    this.endScreen.active = true;
    this.installButtonGameplay.active = true;
    AnimUtils.animateOpacity(this.endScreen, 255, 0.5, () => {
      superHtml.trackEvent(PlayableAnalyticsEvent.ENDCARD_SHOWN);
    });
  }

  public finishOpeningTutorial(): void {
    AnimUtils.animateOpacity(this.startScreen, 0, 0.5, () => {
      this.startScreen.active = false;
      ShieldController.instance.changeColliderRadius(62.9);
    });
  }
}
