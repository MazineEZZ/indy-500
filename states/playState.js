import {
  UILayer,
  Label,
  ResourceBar,
  Checkbox,
  Slider,
  Button,
} from "../ui/ui.js";
import { Player } from "../entities/player.js";
import { gameSettings } from "../data/settings.js";
import { Car } from "../entities/car.js";
import { roundTo } from "../utilities/utils.js";

function setUpPlayState(
  gameState,
  entities,
  collisions,
  inputs,
  tooltips,
  events,
) {
  // Entities
  const car = new Car("car", 20, 20, 20 * 4, 8 * 4, collisions, inputs, events);

  // Registration
  collisions.register(car);
  entities.register(car);

  // UI
  return loadPlayUI(gameState, tooltips, events);
}

function loadPlayUI(gameState, tooltips, events) {
  const playUI = new UILayer();
  gameState.states.play.ui = playUI;

  // Element
  const playerHealthBar = new ResourceBar(
    20,
    gameSettings.height - 30 - 20,
    200,
    30,
    3,
  );

  const carSpeedLabel = new Label(20, gameSettings.height - 30 - 40, {
    text: "0 m/s",
  });

  // Registration
  playUI.register(playerHealthBar);
  playUI.register(carSpeedLabel);

  tooltips.register(
    playerHealthBar,
    "This is a player's healthbar",
    gameState.states.play,
  );

  // Events
  events.on("playerHealthChanged", ({ current, max }) =>
    playerHealthBar.setValue(current, max),
  );
  events.on("carInfoUpdated", ({ speed }) => {
    carSpeedLabel.setText(
      `${speed.toFixed(2)} m/s, ${(speed * 3.6).toFixed(2)} km/h`,
    );
  });

  return playUI;
}

export { setUpPlayState };
