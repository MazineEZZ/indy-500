import { Rect } from "../core/rect.js";
import { Vector2 } from "../core/vector.js";
import { clamp, toRad } from "../utilities/utils.js";

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
    this.acceleration = new Vector2();
    this.f_drag = new Vector2();
    this.f_braking = new Vector2();
    this.f_drive = new Vector2();
    this.f_rr = new Vector2();
    this.f_total = new Vector2();
    this.heading = 0;
    this.deltaWheel = 0;
    this.angular = 0;

    //? Corvette C5 properties
    this.MASS = 1472;
    this.WHEELBASE = 2.5;

    // For now it's going to be preset but later I should make it realistic
    this.C_DRAG = 0.5 * 0.3 * 2.2 * 1.29;
    this.BREAKING_DECEL = 8;
    this.T_ENGINE = 508 * 4;
    this.FIRST_GEAR = 2.66;
    this.DIFF_RATIO = 3.42;
    this.WHEEL_RADIUS = 0.33;
    this.TRANS_EFFIC = 0.75;
    this.MAX_WHEEL_ROTATION = toRad(24); // 24 degrees
  }
  applyTransform(ctx) {
    ctx.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2,
    );
    ctx.rotate(this.heading);
  }
  checkDriveInput() {
    this.forward = 0;

    if (this.input.isDown("go_forward")) {
      this.forward = 1;
    }
    if (this.input.isDown("go_backward")) {
      this.forward = -1;
    }
  }
  checkSteeringInput(dt) {
    if (this.input.isDown("turn_right")) {
      this.deltaWheel += 0.1 * dt;
    }
    if (this.input.isDown("turn_left")) {
      this.deltaWheel -= 0.1 * dt;
    }

    this.deltaWheel = clamp(
      -this.MAX_WHEEL_ROTATION,
      this.deltaWheel,
      this.MAX_WHEEL_ROTATION,
    );
  }
  updateAngularVel() {
    this.angular = (this.speed * Math.sin(this.deltaWheel)) / this.WHEELBASE;
  }
  updateVelocity() {
    this.velocity.x = this.speed * Math.cos(this.heading);
    this.velocity.y = this.speed * Math.sin(this.heading);
  }
  updateAccel() {
    // Drag force
    this.f_drag.x = -this.C_DRAG * this.velocity.length() * this.velocity.x;
    this.f_drag.y = -this.C_DRAG * this.velocity.length() * this.velocity.y;

    // Braking force
    this.f_braking = this.MASS * this.BREAKING_DECEL;

    // Drive Force
    const F_DRIVE =
      (this.forward *
        this.T_ENGINE *
        this.FIRST_GEAR *
        this.DIFF_RATIO *
        this.TRANS_EFFIC) /
      this.WHEEL_RADIUS;
    this.f_drive.x = F_DRIVE * Math.cos(this.heading);
    this.f_drive.y = F_DRIVE * Math.sin(this.heading);

    // Rolling Resistance Forces
    this.C_RR = this.C_DRAG * 30;
    this.f_rr.x = -this.C_RR * this.velocity.x;
    this.f_rr.y = -this.C_RR * this.velocity.y;

    // Longitudinal Forces
    this.f_total.x = this.f_drive.x + this.f_drag.x + this.f_rr.x;
    this.f_total.y = this.f_drive.y + this.f_drag.y + this.f_rr.y;

    // Acceleration
    this.acceleration.x = this.f_total.x / this.MASS;
    this.acceleration.y = this.f_total.y / this.MASS;
  }
  update(dt) {
    this.checkDriveInput();
    this.checkSteeringInput(dt);

    // Update speed
    this.speed =
      this.velocity.x * Math.cos(this.heading) +
      this.velocity.y * Math.sin(this.heading);

    this.updateAngularVel();

    this.heading += this.angular * dt;
    this.updateVelocity();

    // Acceleration
    this.updateAccel();

    // Update velocity and then position
    this.velocity.x += dt * this.acceleration.x;
    this.velocity.y += dt * this.acceleration.y;
    this.position.x += dt * this.velocity.x;
    this.position.y += dt * this.velocity.y;
  }
  draw(ctx) {
    ctx.save();
    this.applyTransform(ctx);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }
}

export { Car };
