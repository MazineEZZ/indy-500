import { Vector2 } from "../core/vector.js";

class Rect {
  constructor(type, x, y, width, height, zIndex, color = "white") {
    this.position = new Vector2(x, y);
    this.width = width;
    this.height = height;
    this.zIndex = zIndex;
    this.color = color;
    this.type = type;
  }
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  update(dt) {}
  onHit() {}
}

export { Rect };
