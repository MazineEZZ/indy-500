import { RegistrySystem } from "./registry.js";

class EntityRegistry extends RegistrySystem {
  constructor() {
    super();
  }
  sortByLayers() {
    this.elements.sort((a, b) => a.zIndex - b.zIndex);
  }
}
export { EntityRegistry };
