import { Rect } from "../core/rect.js";

class Wheel extends Rect {
  constructor(x, y, width, height) {
    super("wheel", x, y, width, height, 2, "black");
  }
  draw(ctx) {
    super.draw(ctx);
  }
}

export { Wheel };
