class AssetManager {
  constructor() {
    this.images = new Map();
    this.data = new Map();
    this.assetDir = "assets/";
  }
  async loadImage(key, url) {
    const img = new Image();

    img.src = this.assetDir + url;

    try {
      await img.decode();

      this.images.set(key, img);
    } catch (err) {
      console.error("Failed to load or decode the image:", err);
      throw err;
    }
  }
  async loadData(key, url) {
    const response = await fetch(this.assetDir + url);

    if (!response.ok)
      throw new Error(
        "Failed to fetch data:",
        response.status,
        response.statusText,
      );

    try {
      const json = await response.json();

      this.data.set(key, json);
    } catch (err) {
      console.error("Failed to load data:", err);
      throw err;
    }
  }
  getImage(key) {
    return this.images.get(key);
  }
  getData(key) {
    return this.data.get(key);
  }
}

export { AssetManager };
