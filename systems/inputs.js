import { isMouseOverlapping } from "../ui/ui";

class Inputs {
  constructor(bindings, mouse, entities, ui) {
    this.bindings = bindings;
    this.mouse = mouse;
    this.ui = ui;
    this.entities = entities;
    this.keys = {};
  }
  setUpInputs() {
    document.addEventListener("keydown", (e) => {
      if (!(e.key in this.keys)) {
        this.keys[e.key] = { state: false, handled: false };
      }
      if (!this.keys[e.key].state) {
        this.keys[e.key].handled = false;
      }
      this.keys[e.key].state = true;
    });
    document.addEventListener("keyup", (e) => {
      if (!(e.key in this.keys)) {
        this.keys[e.key] = { state: false, handled: false };
      }
      this.keys[e.key].state = false;
    });
  }
  isDown(action) {
    return !!this.keys[this.bindings[action]]?.state;
  }
  isDownOnce(action) {
    const key = this.bindings[action];
    if (!this.keys[key]?.handled && !!this.keys[key]?.state) {
      this.keys[key].handled = true;
      return true;
    }
    return false;
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
  update(dt, mouse) {
    this.mouse = mouse;
  }
}

export { Inputs };
