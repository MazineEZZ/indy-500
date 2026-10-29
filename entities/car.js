import { Rect } from "../core/rect.js";
import { Vector2, dotProduct } from "../core/vector.js";
import { clamp, lerp, toRad } from "../utilities/utils.js";
import { Wheel } from "./wheel.js";

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
    mass,
    wheelbase,
    carLength,
    carWidth,
    carHeight,
    cAlphaF,
    cAlphaR,
    tEngine,
    firstGear,
    wheelRadius,
    wheelWidth,
    wheelOffset,
    enginePower,
    brakeStrength,
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

    //? Per car properties
    this.MASS = 1472;
    this.WHEELBASE = 2.65;
    this.LENGTH = 4.566;
    this.WIDTH = 1.869;
    this.C_ALPHA_F = 72500;
    this.C_ALPHA_R = 72500;
    this.T_ENGINE = 508;
    this.FIRST_GEAR = 2.66;
    this.WHEEL_RADIUS = 0.33;
    this.WHEEL_WIDTH = 0.2159;
    this.WHEEL_OFFSET = 0.15;
    this.ENGINE_POWER = 250000;
    this.BRAKE_STRENGTH = 0.85;

    this.PX_PER_M = this.width / this.LENGTH;

    // Terrain Constants
    this.ASPHALT_FRICTION = 1; // mu
    this.currTerrFrict = this.ASPHALT_FRICTION;

    // General Properties
    this.GRAVITY = 9.81; // m/s^2
    this.C_DRAG = 0.5 * 0.3 * 2.2 * 1.29;
    this.DIFF_RATIO = 3.42;
    this.TRANS_EFFIC = 0.75;
    this.MAX_WHEEL_ROTATION = toRad(24); // 24 degrees
    this.LOW_SPEED_THRESHOLD = 2; // m/s

    // Wheels
    this.wheelOffset = (this.WHEEL_OFFSET * this.LENGTH * this.PX_PER_M) / 2;
    this.wheelRadius = this.WHEEL_RADIUS * this.PX_PER_M;
    this.wheelWidth = this.WHEEL_WIDTH * this.PX_PER_M;

    // Front left wheel
    this.flWheel = new Wheel(
      this.width / 2 - this.wheelRadius * 2 - this.wheelOffset,
      -this.height / 2 - this.wheelWidth / 2,
      this.wheelRadius * 2,
      this.wheelWidth,
    );

    // Front right wheel
    this.frWheel = new Wheel(
      this.width / 2 - this.wheelRadius * 2 - this.wheelOffset,
      this.height / 2 - this.wheelWidth / 2,
      this.wheelRadius * 2,
      this.wheelWidth,
    );

    // Rear left wheel
    this.rlWheel = new Wheel(
      -this.width / 2 + this.wheelOffset,
      this.height / 2 - this.wheelWidth / 2,
      this.wheelRadius * 2,
      this.wheelWidth,
    );

    // Rear right wheel
    this.rrWheel = new Wheel(
      -this.width / 2 + this.wheelOffset,
      -this.height / 2 - this.wheelWidth / 2,
      this.wheelRadius * 2,
      this.wheelWidth,
    );
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
  checkSteeringInput(dt, maxGrip) {
    let isTurning = false;
    const turnRate = 1.5;
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

    const speed = Math.max(this.velocity.length(), 1);

    // Wheel angle that follows the tightest circle the tires can hold at this speed
    const gripAngle = Math.atan(
      (this.WHEELBASE * this.ASPHALT_FRICTION * this.GRAVITY) / speed ** 2,
    );
    // Extra angle the tire needs just to start producing its peak force
    const peakSlip = maxGrip / (2 * this.C_ALPHA_F);

    const maxSteer = clamp(
      toRad(2),
      gripAngle + peakSlip,
      this.MAX_WHEEL_ROTATION,
    );
    this.deltaWheel = clamp(-maxSteer, this.deltaWheel, maxSteer);
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
  calcDragF() {
    this.f_drag.x = -this.C_DRAG * this.velocity.length() * this.velocity.x;
    this.f_drag.y = -this.C_DRAG * this.velocity.length() * this.velocity.y;
  }
  calcDriveF(maxGrip) {
    let F_RAW =
      (this.T_ENGINE * this.FIRST_GEAR * this.DIFF_RATIO * this.TRANS_EFFIC) /
      this.WHEEL_RADIUS;
    const powerLimit =
      this.ENGINE_POWER / Math.max(Math.abs(this.vel_forward), 5);

    const driveMag = this.isBraking ? 0 : this.forward;

    const F_DRIVE = driveMag * Math.min(F_RAW, powerLimit, 0.7 * maxGrip);

    this.f_drive.x = F_DRIVE * Math.cos(this.heading);
    this.f_drive.y = F_DRIVE * Math.sin(this.heading);
    return F_DRIVE;
  }
  calcRRF() {
    this.C_RR = this.C_DRAG * 30;
    this.f_rr.x = -this.C_RR * this.velocity.x;
    this.f_rr.y = -this.C_RR * this.velocity.y;
  }
  calcLateralF(maxGrip, F_DRIVE, F_BRAKING) {
    // Max grip is the budget when driving
    // Braking force is the other budget
    // if the car is braking to implement drifting
    this.calcSlip();

    const budget = this.isBraking ? F_BRAKING / 2 : F_DRIVE;
    const maxLatF = this.isBraking
      ? Math.sqrt(Math.max(0, maxGrip ** 2 - budget ** 2))
      : maxGrip;
    const maxLatR = Math.sqrt(Math.max(0, maxGrip ** 2 - budget ** 2));

    // Blending Factor
    const t = clamp(0, this.velocity.length() / this.LOW_SPEED_THRESHOLD, 1);
    this.f_lateral_f = -this.C_ALPHA_F * this.front_slip * 2;
    this.f_lateral_r = -this.C_ALPHA_R * this.rear_slip * 2;
    // Low speed limiter
    this.f_lateral_f =
      -maxLatF *
      Math.tanh((this.C_ALPHA_F * 2 * this.front_slip) / maxLatF) *
      t;
    this.f_lateral_r =
      -maxLatR *
      Math.tanh((this.C_ALPHA_R * 2 * this.rear_slip) / Math.max(maxLatR, 1)) *
      t;
    // Tire force saturation
    this.f_lateral_f = clamp(-maxLatF, this.f_lateral_f, maxLatF);
    this.f_lateral_r = clamp(-maxLatR, this.f_lateral_r, maxLatR);
  }
  calcBrakingF(maxGrip) {
    const F_BRAKING = maxGrip * 2 * this.BRAKE_STRENGTH;

    if (this.isBraking) {
      this.f_braking.x = F_BRAKING * -Math.cos(this.heading);
      this.f_braking.y = F_BRAKING * -Math.sin(this.heading);
    } else {
      this.f_braking.x = 0;
      this.f_braking.y = 0;
    }

    return F_BRAKING;
  }
  updateAccel(maxGrip) {
    // Drag force
    this.calcDragF();

    // Braking force
    const F_BRAKING = this.calcBrakingF(maxGrip);

    // Drive Force
    const F_DRIVE = this.calcDriveF(maxGrip);

    // Rolling Resistance Forces
    this.calcRRF();

    // Lateral Forces
    this.calcLateralF(maxGrip, F_DRIVE, F_BRAKING);

    // Total Forces
    this.f_total.x =
      this.f_drive.x +
      this.f_drag.x +
      this.f_rr.x +
      this.f_lateral_f * -Math.sin(this.heading + this.deltaWheel) +
      this.f_lateral_r * -Math.sin(this.heading) +
      this.f_braking.x;
    this.f_total.y =
      this.f_drive.y +
      this.f_drag.y +
      this.f_rr.y +
      this.f_lateral_f * Math.cos(this.heading + this.deltaWheel) +
      this.f_lateral_r * Math.cos(this.heading) +
      this.f_braking.y;

    // Acceleration
    this.acceleration.x = this.f_total.x / this.MASS;
    this.acceleration.y = this.f_total.y / this.MASS;
  }
  update(dt) {
    const maxGrip = (this.currTerrFrict * (this.MASS * this.GRAVITY)) / 2;

    this.checkDriveInput();
    this.checkSteeringInput(dt, maxGrip);

    // Update speed
    this.vel_forward =
      this.velocity.x * Math.cos(this.heading) +
      this.velocity.y * Math.sin(this.heading);

    // Car states
    this.isBraking = this.forward < 0 && this.vel_forward > 0.5;
    // this.isReversing...

    // Acceleration
    this.updateAccel(maxGrip);

    // Update Angular Velocity & Heading
    this.updateRotationKin(dt);

    // Update velocity and then position
    this.velocity.x += dt * this.acceleration.x;
    this.velocity.y += dt * this.acceleration.y;
    this.position.x += dt * this.velocity.x * this.PX_PER_M;
    this.position.y += dt * this.velocity.y * this.PX_PER_M;

    // Wheels in relation to the car's origin
    this.flWheel.rotation = this.deltaWheel;
    this.frWheel.rotation = this.deltaWheel;

    // Outside interaction
    this.events.emit("carInfoUpdated", { speed: this.velocity.length() });
  }
  draw(ctx) {
    ctx.save();
    this.applyTransform(ctx);
    // Car
    this.drawTrans(
      ctx,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
    );
    // Wheels
    this.flWheel.draw(ctx);
    this.frWheel.draw(ctx);
    this.rlWheel.draw(ctx);
    this.rrWheel.draw(ctx);
    ctx.restore();
  }
}

export { Car };
