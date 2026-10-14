import {
  UILayer,
  Label,
  ResourceBar,
  Checkbox,
  Slider,
  Button,
} from "../ui/ui.js";
import { gameSettings } from "../data/settings.js";

function setUpMenuState(gameState, events) {
  return loadMenuUI(gameState, events);
}

function loadMenuUI(gameState, events) {
  const menuUI = new UILayer();
  gameState.states.menu.ui = menuUI;

  const title = new Label(gameSettings.width / 2, 200, {
    text: "Menu!",
    align: "center",
    baseline: "middle",
  });
  const checkbox = new Checkbox(500, 300, 50, 50, 4);
  const slider = new Slider(500, 400, 200, 30, 4);
  const startGameBtn = new Button(
    gameSettings.width / 2,
    500,
    100,
    30,
    4,
    events,
    "gameStarted",
    {
      btnBorderSize: "4px",
      btnBorderColor: "black",
    },
    {
      text: "Play Game",
    },
  );

  menuUI.register(title);
  menuUI.register(checkbox);
  menuUI.register(slider);
  menuUI.register(startGameBtn);

  events.on("gameStarted", (event) => {
    gameState.handleEvent(event);
    events.emit("stateChanged");
  });

  return menuUI;
}

export { setUpMenuState };
