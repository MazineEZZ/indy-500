import { calcDistance2Points } from "../utilities/utils.js";

class ClientMouse {
  constructor(canvas) {
    this.canvas = canvas;

    this._default = { x: -10, y: -10 };
    this.mouse = {
      currPos: this._default,
      lastClickPos: this._default,
      isDown: false,
    };

    this.elements = [];
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
  isHovered(element) {
    for (let i = this.elements.length - 1; i >= 0; i--) {
      if (isMouseOverlapping(this.elements[i], this.mouse.currPos)) {
        return this.elements[i] === element;
      }
    }
    return false;
  }
  isClicked(element) {
    for (let i = this.elements.length - 1; i >= 0; i--) {
      if (isMouseOverlapping(this.elements[i], this.mouse.lastClickPos)) {
        return this.elements[i] === element;
      }
    }
    return false;
  }
  updateElements(uis, entities) {
    this.elements.length = 0;
    this.elements.push(...entities);
    this.elements.push(...uis);
  }
}

function isMouseOverlapping(element, mousepos, isCircle = false) {
  if (isCircle) {
    const distance = calcDistance2Points(element.position, mousepos);
    return distance < element.radius;
  }
  return (
    element.position.x < mousepos.x &&
    mousepos.x < element.position.x + element.width &&
    element.position.y < mousepos.y &&
    mousepos.y < element.position.y + element.height
  );
}

export { ClientMouse, isMouseOverlapping };
