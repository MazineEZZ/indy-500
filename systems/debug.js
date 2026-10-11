import { gameSettings } from "../data/settings.js";
import { Label, isMouseOverlapping } from "../ui/ui.js";
import { roundTo } from "../utilities/utils.js";

class DebugOverlay {
  constructor(entities, collisions, inputs) {
    this.inputs = inputs;
    this.isOn = false;
    this.entities = entities;
    this.collisions = collisions;

    // Screen Stats
    this.fps = 0;
    this.frames = 1 / 60;
    this.multiplier = 2 / (30 + 1);
    this.timer = 0;

    // Hitbox
    this.isTracking = false;
    this.trackedEntity = {};

    // Grid
    this.cellSize = gameSettings.cellSize;

    // UI
    this.debugColor = "green";
    this.fpsLabel = new Label(gameSettings.width - 20, 40, {
      text: "fps: 00",
      align: "right",
      color: this.debugColor,
    });
    this.countLabel = new Label(gameSettings.width - 20, 70, {
      align: "right",
      color: this.debugColor,
    });
  }
  set setState(isOn) {
    this.isOn = isOn;
  }
  update(dt, mouse) {
    if (this.inputs.isDownOnce("debug_game")) {
      this.setState = !this.isOn;
    }
    if (!this.isOn) return;

    // Entity Count
    this.countLabel.setText(`entity_count: ${this.entities.elements.length}`);

    // Check if an entity is clicked then track it's position
    for (const ent of this.entities.elements) {
      if (isMouseOverlapping(ent, mouse.lastClickPos)) {
        this.isTracking = this.trackedEntity === ent ? !this.isTracking : true;
        this.trackedEntity = ent;
      }
    }

    this.timer += dt;

    if (this.timer >= 0.5) {
      if (this.isTracking) {
        console.log(
          "x: ",
          roundTo(this.trackedEntity.position.x, 0),
          "y: ",
          roundTo(this.trackedEntity.position.y, 0),
        );
      }
      this.timer -= this.timer;
    }

    // FPS
    this.frames = dt * this.multiplier + this.frames * (1 - this.multiplier);

    this.fps = roundTo(1 / this.frames, 2);
    this.fpsLabel.setText(`fps: ${this.fps}`);
  }
  drawScreenStats(ctx) {
    if (!this.isOn) return;

    this.fpsLabel.draw(ctx);
    this.countLabel.draw(ctx);
  }
  drawGrid(ctx) {
    if (!this.isOn) return;
    ctx.save();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 6;

    for (let i = 0; i < gameSettings.width; i += this.cellSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, gameSettings.height);
      ctx.stroke();
    }
    for (let i = 0; i < gameSettings.height; i += this.cellSize) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(gameSettings.width, i);
      ctx.stroke();
    }
    ctx.restore();
  }
  drawHitboxes(ctx) {
    if (!this.isOn) return;

    ctx.save();
    ctx.lineWidth = 4;

    for (const hitbox of this.collisions.elements) {
      ctx.strokeStyle = "red";
      if (hitbox.type === "player") {
        ctx.strokeStyle = "magenta";
      }

      ctx.strokeRect(
        hitbox.position.x,
        hitbox.position.y,
        hitbox.width,
        hitbox.height,
      );
    }
    ctx.restore();
  }
}

export { DebugOverlay };
