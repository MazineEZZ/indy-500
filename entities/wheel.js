import { Rect } from "../core/rect.js";

class Wheel extends Rect {
  constructor(x, y, width, height) {
    super("wheel", x, y, width, height, "black");
    this.rotation = 0;
  }
  applyTransform(ctx) {
    ctx.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2,
    );
    ctx.rotate(this.rotation);
  }
  draw(ctx) {
    ctx.save();
    this.applyTransform(ctx);
    super.drawTrans(
      ctx,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
    );
    ctx.restore();
  }
}

export { Wheel };
