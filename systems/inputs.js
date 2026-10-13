class Inputs {
  constructor(bindings) {
    this.bindings = bindings;
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
}

export { Inputs };
