import { TextBox, isMouseOverlapping } from "./ui.js";

class Tooltip extends TextBox {
  constructor(
    color,
    {
      fontSize = "20px",
      fontClr = "white",
      fontBorderClr = "black",
      fontBorderSize = 4,
      fontAlign = "left",
      fontBaseline = "top",
    } = {},
  ) {
    super(0, 0, 0, 0, 1, color, {
      fontSize,
      fontClr,
      fontBorderClr,
      fontBorderSize,
      fontAlign,
      fontBaseline,
    });
    this.padding = 10;
    this._dirty = false;
    this.maxWidth = 200;
  }
}

class TooltipManager {
  constructor() {
    this.tooltip = new Tooltip("black");
    this.trackedEntities = [];
  }
  register(entity, text, state) {
    this.trackedEntities.push({ entity, text, state });
  }
  clear() {
    this.trackedEntities = [];
  }
  update(dt, mouse, state) {
    for (const te of this.trackedEntities) {
      if (isMouseOverlapping(te.entity, mouse.position) && te.state === state) {
        const offset = 10;
        this.tooltip.position.x =
          te.entity.position.x + te.entity.width + offset;
        this.tooltip.position.y = te.entity.position.y;
        this.tooltip.setText(te.text);
        te.showTooltip = true;
      } else {
        te.showTooltip = false;
      }
    }
  }
  draw(ctx) {
    for (const te of this.trackedEntities) {
      if (!te.showTooltip) continue;

      this.tooltip.draw(ctx);
    }
  }
}

export { TooltipManager, Tooltip };
