import { _decorator, Component, EventTarget } from "cc";

const { ccclass } = _decorator;

export enum GameEvent {
  Start = "start",
  End = "end",
  Restart = "restart",
  OpeningCleared = "opening-cleared",
}

type EventListener = (...args: any[]) => void;

@ccclass("EventSystem")
export class EventSystem extends Component {
  private static readonly eventTarget = new EventTarget();

  public static on(
    event: GameEvent,
    listener: EventListener,
    target: object,
  ): void {
    this.eventTarget.on(event, listener, target);
  }

  public static off(
    event: GameEvent,
    listener: EventListener,
    target: object,
  ): void {
    this.eventTarget.off(event, listener, target);
  }

  public static emit(event: GameEvent): void {
    this.eventTarget.emit(event);
  }
}
