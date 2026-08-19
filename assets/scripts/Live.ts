import { _decorator, Component, UIOpacity } from "cc";

const { ccclass, property } = _decorator;

@ccclass("Live")
export class Live extends Component {
  @property(UIOpacity) public view: UIOpacity = null!;

  public show(): void {
    this.view.opacity = 255;
  }

  public hide(): void {
    this.view.opacity = 0;
  }
}
