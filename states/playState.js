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

function setUpPlayState(
  gameState,
  entities,
  collisions,
  inputs,
  tooltips,
  events,
) {
  // Entities
  const player = new Player(
    "player",
    20,
    20,
    40,
    100,
    40,
    100,
    4,
    300,
    collisions,
    inputs,
    events,
    "yellow",
  );

  // Registration
  collisions.register(player);
  entities.register(player);

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

  // Registration
  playUI.register(playerHealthBar);

  // Tooltipss
  tooltips.register(
    playerHealthBar,
    "This is a player's healthbar",
    gameState.states.play,
  );

  // Events
  events.on("playerHealthChanged", ({ current, max }) =>
    playerHealthBar.setValue(current, max),
  );

  return playUI;
}

export { setUpPlayState };
