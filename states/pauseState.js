import {
  UILayer,
  Label,
  ResourceBar,
  Checkbox,
  Slider,
  Button,
} from "../ui/ui.js";
import { gameSettings } from "../data/settings.js";

function setUpPauseState(gameState, events) {
  gameState.states.paused.ui = loadPauseUI(gameState, events);
}

function loadPauseUI(gameState, events) {
  const ui = new UILayer();

  // Elements
  const pauseText = new Label(gameSettings.width / 2, gameSettings.height / 2, {
    text: "Game Paused",
    align: "center",
    baseline: "middle",
  });

  const menuBtnWidth = 200;
  const menuBtn = new Button(
    gameSettings.width / 2 + menuBtnWidth / 2,
    gameSettings.height / 2 + 100,
    menuBtnWidth,
    40,
    4,
    events,
    "gameMenu",
    {
      btnBorderColor: "black",
      btnBorderSize: "4px",
    },
    {
      text: "Quit to Menu",
    },
  );

  // Registration
  ui.register(pauseText);
  ui.register(menuBtn);

  // Events
  events.on("gameMenu", (event) => {
    gameState.handleEvent(event);
    events.emit("stateChanged");
  });
  events.on("togglePause", () => {
    gameState.handleEvent("togglePause");
    events.emit("stateChanged");
  });

  return ui;
}

export { setUpPauseState };
