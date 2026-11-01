const gameSettings = Object.freeze({
  width: 1280,
  height: 720,
  ratio: 16 / 9,
  margin: 5,
  cellSize: 40,
  bgColor: "rgb(82, 171, 244)",
});

const inputBindings = Object.freeze({
  go_forward: "z",
  go_backward: "s",
  turn_left: "q",
  turn_right: "d",
  debug_game: "o",
  pause_game: "p",
  test: "l",
  test2: "m",
});

export { gameSettings, inputBindings };
