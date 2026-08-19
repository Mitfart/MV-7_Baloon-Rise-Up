import { _decorator, Component, instantiate, Node, Prefab } from "cc";
import { Live } from "./Live";

const { ccclass, property } = _decorator;

@ccclass("Lives")
export class Lives extends Component {
  @property(Prefab) public livePrefab: Prefab = null!;
  @property(Node) public container: Node = null!;

  private liveViews: Live[] = [];

  public start(): void {
    this.container.destroyAllChildren();
  }

  public create(count: number): void {
    this.container.destroyAllChildren();
    this.liveViews = [];
    for (let index = 0; index < count; index++) {
      const live = instantiate(this.livePrefab);
      this.container.addChild(live);
      const liveView = live.getComponent(Live)!;
      liveView.show();
      this.liveViews.push(liveView);
    }
  }

  public hideLast(): void {
    this.liveViews.pop()?.hide();
  }
}
