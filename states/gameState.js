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
    onEnter: (events) => {
      events.emit("gamePaused");
    },
  },
);
const menuState = new State([
  {
    event: "gameStarted",
    state: "play",
    action: "clear",
  },
]);
const playState = new State(
  [
    {
      event: "togglePause",
      state: "paused",
      action: "push",
    },
  ],
  {
    onEnter: (events) => events.emit("gameUnpaused"),
  },
);

export { pausedState, menuState, playState };
