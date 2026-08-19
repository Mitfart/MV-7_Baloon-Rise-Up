import { _decorator, Component, Label, Node, ProgressBar } from "cc";
import { UI_Screen } from "../Cocos_Engine/General/Code/ui/UI_Screen";
import { GameManager } from "./GameManager";

const { ccclass, executionOrder, property } = _decorator;

@ccclass("FailEndcard")
@executionOrder(-1)
export class FailEndcard extends Component {
  public static instance: FailEndcard;

  @property(UI_Screen) public screen: UI_Screen = null!;
  @property(Label) public countdownLabel: Label = null!;
  @property(ProgressBar) public countdownProgress: ProgressBar = null!;
  @property(Node) public tryAgainButton: Node = null!;

  private startedAt = 0;
  private isCountingDown = false;

  public onLoad(): void {
    FailEndcard.instance = this;
  }

  public show(): void {
    this.startedAt = Date.now();
    this.isCountingDown = true;
    this.tryAgainButton.active = true;
    this.updateCountdown(10);
    this.screen.show();
  }

  public hide(): void {
    this.isCountingDown = false;
    this.screen.hide();
  }

  public onTryAgainClick(): void {
    if (!this.isCountingDown) {
      GameManager.instance.onInstallButtonClick();
      return;
    }

    this.isCountingDown = false;
    GameManager.instance.restartAll();
  }

  public update(): void {
    if (!this.isCountingDown) {
      return;
    }

    const remaining = Math.max(0, 10 - (Date.now() - this.startedAt) / 1000);
    this.updateCountdown(remaining);
    if (remaining === 0) {
      this.isCountingDown = false;
      GameManager.instance.onInstallButtonClick();
    }
  }

  private updateCountdown(remaining: number): void {
    this.countdownLabel.string = Math.ceil(remaining).toString();
    this.countdownProgress.progress = remaining / 10;
  }
}
