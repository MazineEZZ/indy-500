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
    this.acceleration = 100;

    // Corvette C5 properties
    this.MASS = 1472;

    // For now it's going to be preset but later I should make it realistic
    this.C_DRAG = 0.5 * 0.3 * 2.2 * 1.29;
  }
  update(dt) {
    this.dir.x = 0;

    if (this.input.isDown("go_forward")) {
      this.dir.x = 1;
    }
    if (this.input.isDown("go_backward")) {
      this.dir.x = -1;
    }

    if (this.dir.x !== 0) {
      this.velocity.x += dt * this.acceleration * this.dir.x;
    } else {
      // Clamp to 0
      if (this.velocity.x > 0) {
        this.velocity.x = Math.max(0, this.velocity.x - this.acceleration * dt);
      } else if (this.velocity.x < 0) {
        this.velocity.x = Math.min(0, this.velocity.x + this.acceleration * dt);
      }
    }
    this.position.x += dt * this.velocity.x;
  }
}

export { Car };
