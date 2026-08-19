import { _decorator, CCFloat, Component, Vec3 } from "cc";

const { ccclass, property } = _decorator;

@ccclass("TutorialHandMotion")
export class TutorialHandMotion extends Component {
  @property(Vec3) public centerPosition = new Vec3(0, 0);
  @property(Vec3) public endPosition = new Vec3(240, -220);
  @property(CCFloat) public duration = 2.5;

  private startPosition = new Vec3();
  private elapsed = 0;

  public onEnable(): void {
    this.startPosition.set(this.node.position);
    this.elapsed = 0;
  }

  public update(deltaTime: number): void {
    const duration = Math.max(this.duration, Number.EPSILON);
    this.elapsed = (this.elapsed + deltaTime) % duration;
    const angle = (2 * Math.PI * this.elapsed) / duration;
    const progress = (1 - Math.cos(angle)) * 0.5;
    const arc = Math.sin(angle);
    this.node.setPosition(
      this.startPosition.x + (this.endPosition.x - this.startPosition.x) * progress + (this.centerPosition.x - (this.startPosition.x + this.endPosition.x) * 0.5) * arc,
      this.startPosition.y + (this.endPosition.y - this.startPosition.y) * progress + (this.centerPosition.y - (this.startPosition.y + this.endPosition.y) * 0.5) * arc,
      this.startPosition.z + (this.endPosition.z - this.startPosition.z) * progress + (this.centerPosition.z - (this.startPosition.z + this.endPosition.z) * 0.5) * arc,
    );
  }
}
