import { State, StateManager } from "../systems/states.js";

// GAME STATE
const pausedState = new State(
	[
		{
			event: "togglePause",
			state: "play",
		},
		{
			event: "gameMenu",
			state: "menu",
		},
	],
	{
		onEnter: (game) => {
			game.events.emit("gamePaused");
		},
		update: (dt, game) => {
			game.pauseUI.draw(game.ctx);
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
			// UI
			game.playUI.draw(game.ctx);
		},
	},
);

const gameState = new StateManager({
	paused: pausedState,
	menu: menuState,
	play: playState,
});

export { gameState };
