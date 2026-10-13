import { isMouseOverlapping } from "../ui/ui.js";

class ClientMouse {
  constructor(canvas, ui, entities) {
    this.canvas = canvas;

    this.ui = ui;
    this.entities = entities;

    this._default = { x: -10, y: -10 };
    this.mouse = {
      currPos: this._default,
      lastClickPos: this._default,
      isDown: false,
    };
  }
  getScaledMousePos(e) {
    return {
      x: e.offsetX * (this.canvas.width / this.canvas.clientWidth),
      y: e.offsetY * (this.canvas.height / this.canvas.clientHeight),
    };
  }
  setUpMouseListeners() {
    this.canvas.addEventListener("mousedown", (e) => {
      this.mouse.lastClickPos = this.getScaledMousePos(e);
      this.mouse.isDown = true;
    });
    this.canvas.addEventListener("mouseup", (e) => {
      this.mouse.isDown = false;
    });
    this.canvas.addEventListener("mousemove", (e) => {
      this.mouse.currPos = this.getScaledMousePos(e);
    });
  }
  resetClick() {
    this.mouse.lastClickPos = this._default;
  }
  isClicked(element) {
    const elements = [...this.ui.elements, ...this.entities.elements];
    for (let i = elements.length - 1; i >= 0; i--) {
      if (isMouseOverlapping(elements[i], this.mouse.lastClickPos)) {
        return elements[i] === element;
      }
    }
    return false;
  }
}

export { ClientMouse };
