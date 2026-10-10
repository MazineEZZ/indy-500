class RegistrySystem {
  constructor() {
    this.elements = [];
  }
  register(element) {
    this.elements.push(element);
  }
  unregister(element) {
    const i = this.elements.indexOf(element);
    if (i !== -1) this.elements.splice(i, 1);
  }
  draw(ctx) {
    for (const e of [...this.elements]) {
      if (typeof e.draw === "function") {
        e.draw(ctx);
      }
    }
  }
  update(dt, mouse) {
    for (const e of [...this.elements]) {
      if (typeof e.update === "function") {
        e.update(dt, mouse);
      }
    }
  }
}
export { RegistrySystem };
