import { _decorator, Collider2D, Component, Contact2DType, Node } from "cc";
import { GameManager } from "./GameManager";
import { PhysicsObstacle } from "./PhysicsObstacle";

const { ccclass, property } = _decorator;

@ccclass("Checkpoint")
export class Checkpoint extends Component {
  @property(Collider2D) public trigger: Collider2D = null!;
  @property(Node) public spawn: Node = null!;

  public onEnable(): void {
    this.trigger.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
  }

  public onDisable(): void {
    this.trigger.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
  }

  public activate(): void {
    GameManager.instance.setCheckpoint(this.spawn);
  }

  private onBeginContact(_: Collider2D, other: Collider2D): void {
    other.getComponent(PhysicsObstacle)?.expire();
  }
}
