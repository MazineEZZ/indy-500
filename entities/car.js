import { Rect } from "../core/rect.js";
import { Vector2, dotProduct } from "../core/vector.js";
import { clamp, lerp, toRad } from "../utilities/utils.js";
import { Wheel } from "./wheel.js";
import { RegistrySystem } from "../systems/registry.js";

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
    this.f_lateral_f = 0;
    this.f_lateral_r = 0;
    this.vel_forward = 0;
    this.heading = 0;
    this.deltaWheel = 0;
    this.angular = 0;
    this.vel_lateral = 0;

    // Wheels
    this.wheels = new RegistrySystem();
    const wheelOffset = 5;
    const wheelRadius = 20;
    const wheelWidth = 10;
    this.flWheel = new Wheel(
      this.position.x + this.width - wheelOffset,
      this.position.y - this.wheelWidth / 2,
      wheelRadius * 2,
      wheelWidth,
    );
    this.frWheel = new Wheel(
      this.position.x + this.width - wheelOffset,
      this.position.y - this.wheelWidth / 2 + this.height,
      wheelRadius * 2,
      wheelWidth,
    );
    this.rlWheel = new Wheel(
      this.position.x + wheelOffset,
      this.position.y - this.wheelWidth / 2,
      wheelRadius * 2,
      wheelWidth,
    );
    this.rrWheel = new Wheel(
      this.position.x + wheelOffset,
      this.position.y + this.height - this.wheelWidth / 2,
      wheelRadius * 2,
      wheelWidth,
    );
    this.wheels.register(this.flWheel);
    this.wheels.register(this.frWheel);
    this.wheels.register(this.rlWheel);
    this.wheels.register(this.rrWheel);

    //? Corvette C5 properties
    this.MASS = 1472;
    this.WHEELBASE = 2.5;
    this.LENGTH = 4.566;
    this.WIDTH = 1.869;

    // Terrain Constants
    this.ASPHALT_FRICTION = 1; // mu

    this.GRAVITY = 9.81; // m/s^2
    this.C_DRAG = 0.5 * 0.3 * 2.2 * 1.29;
    this.C_ALPHA_F = 72500;
    this.C_ALPHA_R = 72500;
    this.BREAKING_DECEL = 8;
    this.T_ENGINE = 508 * 2;
    this.FIRST_GEAR = 2.66;
    this.DIFF_RATIO = 3.42;
    this.WHEEL_RADIUS = 0.33;
    this.TRANS_EFFIC = 0.75;
    this.MAX_WHEEL_ROTATION = toRad(24); // 24 degrees
    this.LOW_SPEED_THRESHOLD = 2; // m/s
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
    let isTurning = false;
    const turnRate = 0.2;
    const returnRate = turnRate * 2;

    if (this.input.isDown("turn_right")) {
      this.deltaWheel += turnRate * dt;
      isTurning = true;
    }
    if (this.input.isDown("turn_left")) {
      this.deltaWheel -= turnRate * dt;
      isTurning = true;
    }
    if (!isTurning) {
      if (this.deltaWheel > 0)
        this.deltaWheel = Math.max(0, this.deltaWheel - returnRate * dt);
      if (this.deltaWheel < 0)
        this.deltaWheel = Math.min(0, this.deltaWheel + returnRate * dt);
    }

    this.deltaWheel = clamp(
      -this.MAX_WHEEL_ROTATION,
      this.deltaWheel,
      this.MAX_WHEEL_ROTATION,
    );
    isTurning = false;
  }
  updateRotationKin(dt) {
    const b = this.WHEELBASE / 2;
    const c = this.WHEELBASE / 2;
    const inertia = (1 / 12) * this.MASS * (this.WIDTH ** 2 + this.LENGTH ** 2);
    const torque =
      b * this.f_lateral_f * Math.cos(this.deltaWheel) - c * this.f_lateral_r;

    const alpha = torque / inertia;

    this.angular += alpha * dt;
    this.heading += this.angular * dt;
  }
  calcSlip() {
    this.vel_lateral = dotProduct(this.velocity, {
      x: -Math.sin(this.heading),
      y: Math.cos(this.heading),
    });

    // Speed is the Forward Velocity
    // this.sideSlip = Math.atan2(this.vel_lateral, this.speed);

    const b = this.WHEELBASE / 2;
    const c = this.WHEELBASE / 2;
    this.front_slip =
      Math.atan2(
        this.vel_lateral + this.angular * b,
        Math.abs(this.vel_forward),
      ) -
      this.deltaWheel * Math.sign(this.vel_forward);

    this.rear_slip = Math.atan2(
      this.vel_lateral - this.angular * c,
      Math.abs(this.vel_forward),
    );
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

    // Lateral Forces
    this.calcSlip();

    this.f_lateral_max =
      (this.ASPHALT_FRICTION * (this.MASS * this.GRAVITY)) / 2;

    // Blending Factor
    const t = clamp(0, this.velocity.length() / this.LOW_SPEED_THRESHOLD, 1);
    this.f_lateral_f = -this.C_ALPHA_F * this.front_slip * 2;
    this.f_lateral_r = -this.C_ALPHA_R * this.rear_slip * 2;
    // Low speed limiter
    this.f_lateral_f = lerp(0, this.f_lateral_f, t);
    this.f_lateral_r = lerp(0, this.f_lateral_r, t);
    // Tire force saturation
    // this.f_lateral_f = clamp(
    //   -this.f_lateral_max,
    //   this.f_lateral_f,
    //   this.f_lateral_max,
    // );
    // this.f_lateral_r = clamp(
    //   -this.f_lateral_max,
    //   this.f_lateral_r,
    //   this.f_lateral_max,
    // );

    // Longitudinal Forces
    this.f_total.x =
      this.f_drive.x +
      this.f_drag.x +
      this.f_rr.x +
      this.f_lateral_f * -Math.sin(this.heading + this.deltaWheel) +
      this.f_lateral_r * -Math.sin(this.heading);
    this.f_total.y =
      this.f_drive.y +
      this.f_drag.y +
      this.f_rr.y +
      this.f_lateral_f * Math.cos(this.heading + this.deltaWheel) +
      this.f_lateral_r * Math.cos(this.heading);

    // if (this.forward < 0) {
    //   this.f_total.x -= this.f_braking * Math.sin();
    //   this.f_total.y -= this.f_braking;
    // }

    // Acceleration
    this.acceleration.x = this.f_total.x / this.MASS;
    this.acceleration.y = this.f_total.y / this.MASS;
  }
  update(dt) {
    this.checkDriveInput();
    this.checkSteeringInput(dt);

    // Update speed
    this.vel_forward =
      this.velocity.x * Math.cos(this.heading) +
      this.velocity.y * Math.sin(this.heading);

    // Acceleration
    this.updateAccel();

    // Update Angular Velocity & Heading
    this.updateRotationKin(dt);

    // Update velocity and then position
    this.velocity.x += dt * this.acceleration.x;
    this.velocity.y += dt * this.acceleration.y;
    this.position.x += dt * this.velocity.x;
    this.position.y += dt * this.velocity.y;

    this.wheels.update(dt);
  }
  draw(ctx) {
    ctx.save();
    this.applyTransform(ctx);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
    this.wheels.draw(ctx);
  }
}

export { Car };
