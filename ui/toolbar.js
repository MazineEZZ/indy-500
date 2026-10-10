import { UIElement, Button, Label, Panel, isMouseOverlapping } from "./ui.js";

class Card extends Panel {
  constructor(x, y, width, height, zIndex, type, events, text, color) {
    super(x, y, width, height, zIndex);
    this.color = color;
    this.type = type;
    this.events = events;

    this.label = new Label(this.position.x, this.position.y, {
      text: text,
      align: "center",
      baseline: "middle",
      fontSize: "16px",
    });
  }
  draw(ctx) {
    super.draw(ctx);
    this.label.position.x = this.position.x + this.width / 2;
    this.label.position.y = this.position.y + this.height / 2;
    this.label.draw(ctx);
  }
  update(dt, mouse) {
    if (isMouseOverlapping(this, mouse.lastClickPos)) {
      this.events.emit("towerPicked", this.type);
    }
  }
}

class ToolBar extends UIElement {
  constructor(x, y, width, height, zIndex, events, tools, color) {
    super(x, y, width, height, zIndex);
    this.events = events;
    this.tools = tools;

    // Panel
    this.panel = new Panel(x, y, width, height, zIndex, color);

    // Close Button
    const btnOffset = 10;
    const btnWidth = 50;
    const btnHeight = 50;
    this.closeToolbarBtn = new Button(
      x + btnOffset,
      y + btnOffset,
      btnWidth - btnOffset * 2,
      btnHeight - btnOffset * 2,
      zIndex + 1,
      this.events,
      "toggleToolbar",
      { btnBorderSize: 2, btnBorderColor: "black" },
      {
        text: "x",
        fontClr: "white",
      },
      "red",
      "green",
    );
    // Card properties
    this.xOffset = 80;
    this.cardWidth = 90;
    this.cardHeight = 90;
    this.cardGap = 20;

    // Card Labels
    this.cards = this.tools.map(
      (tool) =>
        new Card(
          0,
          0,
          this.cardWidth,
          this.cardHeight,
          4,
          tool.id, // I'll use the id as types for towers.
          this.events,
          tool.label,
          tool.color,
        ),
    );
  }
  update(dt, mouse) {
    if (!this.visible) return;
    this.closeToolbarBtn.update(dt, mouse);
    this.cards.forEach((card) => card.update(dt, mouse));
  }
  drawCards(ctx) {
    ctx.imageSmoothingEnabled = true;

    for (const [i, tool] of this.tools.entries()) {
      const offset = (this.cardWidth + this.cardGap) * i;

      this.cards[i].position.x = this.position.x + this.xOffset + offset;
      this.cards[i].position.y =
        this.position.y + this.height / 2 - this.cardHeight / 2;
      this.cards[i].draw(ctx);
    }
  }
  draw(ctx) {
    if (!this.visible) return;
    this.panel.draw(ctx);
    this.closeToolbarBtn.draw(ctx);
    this.drawCards(ctx);
  }
}

export { ToolBar };
