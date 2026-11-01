import { clamp, construct2DArray } from "../utilities/utils.js";
import { gameSettings } from "../data/settings.js";

// TileMap needs a lot of work

class TileMap {
  constructor(cellSize, tileMapJSON, tileSetIMG) {
    this.cellSize = cellSize;
    this.width = gameSettings.width;
    this.height = gameSettings.height;

    // Tiled Specific Manipulation
    const tilesetData = tileMapJSON.tilesets[0];
    this.tileWidth = tilesetData.tilewidth;
    this.tileHeight = tilesetData.tileheight;
    this.columns = tilesetData.columns;
    this.firstgid = tilesetData.firstgid;
    this.mapWidth = tileMapJSON.width;
    this.mapHeight = tileMapJSON.height;
    this.tileMap = construct2DArray(
      this.getTileData(tileMapJSON),
      this.mapHeight,
      this.mapWidth,
    );
    this.tileMap = this.combineTileData(this.tileMap, tileMapJSON);
    this.tileSetIMG = tileSetIMG;
  }
  mapPathToCoords(path) {
    return path.map((obj) => ({
      y: obj.row * this.cellSize,
      x: obj.col * this.cellSize,
    }));
  }
  getMarkerCell(json, name) {
    const marker = this.getLayer(json.layers, "markers");
    const point = marker.objects.find((obj) => obj.name === name);
    return {
      col: Math.floor(point.x / this.tileHeight),
      row: Math.floor(point.y / this.tileWidth),
    };
  }
  getSelectedCoords(pos) {
    const x = Math.floor(pos.x / this.cellSize) * this.cellSize;
    const y = Math.floor(pos.y / this.cellSize) * this.cellSize;
    return { x, y };
  }
  getTileData(json) {
    return json.layers[0].data;
  }
  getLayer(layers, key) {
    return layers.find((obj) => obj["name"] === key);
  }
  getLayerData(layers, key) {
    return this.getLayer(layers, key).data;
  }
  combineTileData(tileMap, json) {
    const boolGid = json.tilesets[0].firstgid;
    const track = this.getLayerData(json.layers, "track");

    let ctr = -1;
    return tileMap.map((row) => {
      return row.map((tile) => {
        ctr++;
        return {
          ground: tile,
          track: track[ctr],
        };
      });
    });
  }
  draw(ctx) {
    ctx.save();
    for (let row = 0; row < this.mapHeight; row++) {
      for (let col = 0; col < this.mapWidth; col++) {
        const groundGid = this.tileMap[row][col].ground;
        const trackGid = this.tileMap[row][col].track;

        // Skip over empty tiles
        if (groundGid === 0) continue;
        let localId = groundGid - this.firstgid;
        let srcCol = localId % this.columns;
        let srcRow = Math.floor(localId / this.columns);

        ctx.drawImage(
          this.tileSetIMG,
          srcCol * this.tileWidth,
          srcRow * this.tileHeight,
          this.tileWidth,
          this.tileHeight,
          col * this.cellSize,
          row * this.cellSize,
          this.cellSize,
          this.cellSize,
        );

        if (trackGid === 0) continue;

        localId = trackGid - this.firstgid;
        srcCol = localId % this.columns;
        srcRow = Math.floor(localId / this.columns);

        ctx.drawImage(
          this.tileSetIMG,
          srcCol * this.tileWidth,
          srcRow * this.tileHeight,
          this.tileWidth,
          this.tileHeight,
          col * this.cellSize,
          row * this.cellSize,
          this.cellSize,
          this.cellSize,
        );
      }
    }
    ctx.restore();
  }
}

export { TileMap };
