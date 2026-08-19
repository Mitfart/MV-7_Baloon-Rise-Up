import { _decorator, AudioClip, AudioSource, Component } from "cc";

const { ccclass, property } = _decorator;

export enum ObstacleSound {
  Base,
  Circle,
  Triangle,
}

@ccclass("AudioController")
export class AudioController extends Component {
  public static instance: AudioController;

  @property(AudioSource) public balloonSound: AudioSource = null!;
  @property(AudioSource) public obstacleSound: AudioSource = null!;
  @property(AudioClip) public circleObstacleClip: AudioClip = null!;
  @property(AudioClip) public triangleObstacleClip: AudioClip = null!;

  public onLoad(): void {
    AudioController.instance = this;
  }

  public playBalloon(): void {
    this.balloonSound.play();
  }

  public playObstacle(sound: ObstacleSound): void {
    const clip = sound === ObstacleSound.Circle
      ? this.circleObstacleClip
      : sound === ObstacleSound.Triangle
        ? this.triangleObstacleClip
        : this.obstacleSound.clip!;
    this.obstacleSound.playOneShot(clip, 1);
  }
}
