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
  return loadPauseUI(gameState, events);
}

function loadPauseUI(gameState, events) {
  const pauseUI = new UILayer();
  gameState.states.paused.ui = pauseUI;

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
  pauseUI.register(pauseText);
  pauseUI.register(menuBtn);

  // Events
  events.on("gameMenu", (event) => {
    gameState.handleEvent(event);
    events.emit("stateChanged");
  });
  events.on("togglePause", () => {
    gameState.handleEvent("togglePause");
    events.emit("stateChanged");
  });

  return pauseUI;
}

export { setUpPauseState };
