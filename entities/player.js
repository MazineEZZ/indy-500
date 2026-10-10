import { separate } from "../systems/collisions.js";
import { gameSettings } from "../data/settings.js";
import { Rect } from "../core/rect.js";
import { Vector2 } from "../core/vector.js";
import { isMouseOverlapping } from "../ui/ui.js";

class Player extends Rect {
  constructor(
    type,
    x,
    y,
    width,
    height,
    hitboxWidth,
    hitboxHeight,
    zIndex,
    speed,
    collision,
    input,
    events,
    color = "red",
  ) {
    super(type, x, y, hitboxWidth, hitboxHeight, zIndex, color);
    this.speed = speed;
    this.collision = collision;
    this.events = events;
    this.input = input;
    this.maxHealth = 200;
    this.health = 200;
  }
  update(delta) {
    const dir = new Vector2();

    if (this.input.isDown("move_up")) dir.y -= 1;
    if (this.input.isDown("move_down")) dir.y += 1;
    if (this.input.isDown("move_left")) {
      dir.x -= 1;
      // this.animation.flipH = true;
    }
    if (this.input.isDown("move_right")) {
      dir.x += 1;
      // this.animation.flipH = false;
    }
    if (this.input.isDownOnce("test")) {
      this.health = this.health <= 0 ? 0 : this.health - 20;
      this.events.emit("playerHealthChanged", {
        current: this.health,
        max: this.maxHealth,
      });
    }
    if (this.input.isDownOnce("test2")) {
      this.health =
        this.health >= this.maxHealth ? this.maxHealth : this.health + 100;
      this.events.emit("playerHealthChanged", {
        current: this.health,
        max: this.maxHealth,
      });
    }

    // if (dir.x || dir.y) this.animation.select("run");
    // else this.animation.select("idle");

    const normalized = dir.normalize();
    this.position.x += normalized.x * this.speed * delta;
    this.position.y += normalized.y * this.speed * delta;

    // this.keepInBounds({
    //   width: gameSettings.width,
    //   height: gameSettings.height,
    // });

    // this.animation.update(delta);

    this.collision.check(this);
  }
  keepInBounds(size) {
    for (const axis of ["x", "y"]) {
      const dim = axis === "x" ? "width" : "height";
      if (this.position[axis] <= 0) this.position[axis] = 0;
      if (this.position[axis] + this[dim] >= size[dim])
        this.position[axis] = size[dim] - this[dim];
    }
  }
  onHit(entity) {
    separate(this, entity);
  }
  draw(ctx) {
    //* Hitbox
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    //* Sprite
    // this.animation.position = this.position;
    // this.animation.draw(ctx, this.width, this.height);
  }
}

export { Player };
