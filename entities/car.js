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
    this.f_drag = new Vector2();
    this.f_braking = new Vector2();
    this.f_drive = new Vector2();
    this.f_rr = new Vector2();
    this.heading = 0;

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
  rotate(ctx) {
    ctx.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2,
    );
    ctx.rotate(this.heading);
  }
  updateAccel() {
    // Next task is to make the forces vector based so they can correctly represent the forces
    this.f_drag = -this.C_DRAG * this.velocity.length() * this.velocity.x;
    this.f_braking = this.MASS * this.BREAKING_DECEL;
    this.f_drive =
      (this.forward *
        this.T_ENGINE *
        this.FIRST_GEAR *
        this.DIFF_RATIO *
        this.TRANS_EFFIC) /
      this.WHEEL_RADIUS;
    this.f_rr = -this.C_DRAG * 30 * this.velocity.x;
    // Total forces
    this.f_long = this.f_drive + this.f_drag + this.f_rr;

    this.acceleration = this.f_long / this.MASS;
  }
  update(dt) {
    this.forward = 0;

    if (this.input.isDown("go_forward")) {
      this.forward = 1;
    }
    if (this.input.isDown("go_backward")) {
      this.forward = -1;
    }

    if (this.input.isDown("turn_right")) {
      this.heading += 1 * dt;
    }
    if (this.input.isDown("turn_left")) {
      this.heading -= 1 * dt;
    }

    if (this.heading > Math.PI * 2 || this.heading < -Math.PI * 2) {
      this.heading = 0;
    }

    // Acceleration
    this.updateAccel();

    // Update velocity and then position
    this.velocity.x += dt * this.acceleration * Math.cos(this.heading);
    this.velocity.y += dt * this.acceleration * Math.sin(this.heading);
    this.position.x += dt * this.velocity.x;
    this.position.y += dt * this.velocity.y;
  }
  draw(ctx) {
    ctx.save();
    this.rotate(ctx);
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    ctx.restore();
  }
}

export { Car };
