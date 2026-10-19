import { Rect } from "../core/rect.js";
import { Vector2 } from "../core/vector.js";

class Car extends Rect {
  constructor(
    type,
    x,
    y,
    width,
    height,
    collision,
    input,
    events,
    color = "red",
  ) {
    super(type, x, y, width, height, color);
    this.collision = collision;
    this.input = input;
    this.events = events;

    this.velocity = new Vector2();
    this.dir = new Vector2();

    // Corvette C5 properties
    this.MASS = 1472;

    // For now it's going to be preset but later I should make it realistic
    this.C_DRAG = 0.5 * 0.3 * 2.2 * 1.29;
    this.BREAKING_DECEL = 8;
    this.T_ENGINE = 508 * 2;
    this.FIRST_GEAR = 2.66;
    this.DIFF_RATIO = 3.42;
    this.WHEEL_RADIUS = 0.33;
    this.TRANS_EFFIC = 0.75;
  }
  update(dt) {
    this.dir.x = 0;

    if (this.input.isDown("go_forward")) {
      this.dir.x = 1;
    }
    if (this.input.isDown("go_backward")) {
      this.dir.x = -1;
    }

    // Acceleration
    this.f_drag = -this.C_DRAG * this.velocity.length() * this.velocity.x;
    this.f_braking = this.MASS * this.BREAKING_DECEL;
    this.f_drive =
      (this.dir.x *
        this.T_ENGINE *
        this.FIRST_GEAR *
        this.DIFF_RATIO *
        this.TRANS_EFFIC) /
      this.WHEEL_RADIUS;
    this.f_rr = -this.C_DRAG * 30 * this.velocity.x;

    this.f_long = this.f_drive + this.f_drag + this.f_rr;

    this.acceleration = this.f_long / this.MASS;

    console.log("f_drag:", this.f_drag.toFixed(2));
    console.log("f_drive:", this.f_drive.toFixed(2));
    console.log("f_rr:", this.f_rr.toFixed(2));
    console.log("acceleration:", this.acceleration.toFixed(2));
    console.log("velocity:", this.velocity.x.toFixed(2));

    this.velocity.x += dt * this.acceleration;
    this.position.x += dt * this.velocity.x;
  }
}

export { Car };
