import { State, StateManager } from "../systems/states.js";

// GAME STATE
const pausedState = new State(
  [
    {
      event: "togglePause",
      state: "play",
      action: "pop",
    },
    {
      event: "gameMenu",
      state: "menu",
      action: "clear",
    },
  ],
  {
    onEnter: (game) => {
      game.events.emit("gamePaused");
    },
    update: (dt, game) => {
      game.pauseUI.update(dt, game.clientMouse);
    },
    draw: (game) => {
      game.pauseUI.draw(game.ctx);
    },
  },
);
const menuState = new State(
  [
    {
      event: "gameStarted",
      state: "play",
      action: "clear",
    },
  ],
  {
    update: (dt, game) => {
      game.menuUI.update(dt, game.clientMouse);
    },
    draw: (game) => {
      game.menuUI.draw(game.ctx);
    },
  },
);
const playState = new State(
  [
    {
      event: "togglePause",
      state: "paused",
      action: "push",
    },
  ],
  {
    onEnter: (game) => game.events.emit("gameUnpaused"),
    update: (dt, game) => {
      // Entities
      game.entities.update(dt);
      // UI
      game.playUI.update(dt, game.clientMouse);
    },
    draw: (game) => {
      // Entities
      game.entities.draw(game.ctx);
      // Debug
      game.debugOverlay.drawHitboxes(game.ctx);
      // game.debugOverlay.drawGrid(game.ctx);
      // UI
      game.playUI.draw(game.ctx);
    },
  },
);

export { pausedState, menuState, playState };
