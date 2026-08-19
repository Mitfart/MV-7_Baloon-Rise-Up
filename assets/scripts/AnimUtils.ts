import { Node, tween, UIOpacity } from "cc";

export class AnimUtils {
  public static animateOpacity(
    node: Node,
    to: number,
    time: number,
    onComplete: () => void = () => {},
  ): void {
    tween(node.getComponent(UIOpacity)!)
      .to(time, { opacity: to }, { onComplete })
      .start();
  }
}
