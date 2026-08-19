import { _decorator, Collider2D, Component, Contact2DType } from "cc";
import { GameManager } from "./GameManager";
import { ShieldController } from "./ShieldController";

const { ccclass } = _decorator;

@ccclass("ObstacleDownload")
export class ObstacleDownload extends Component {
  private collider: Collider2D = null!;

  public onLoad(): void {
    this.collider = this.getComponent(Collider2D)!;
  }

  public onEnable(): void {
    this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
  }

  public onDisable(): void {
    this.collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
  }

  private onBeginContact(_: Collider2D, other: Collider2D): void {
    if (other.getComponent(ShieldController)) {
      GameManager.instance.onInstallButtonClick();
    }
  }
}
