import { gameSettings, inputBindings } from "../data/settings.js";
import { Player } from "../entities/player.js";
import { EntityRegistry } from "../systems/entities.js";
import { CollisionSystem } from "../systems/collisions.js";
import { Inputs } from "../systems/inputs.js";
import { EventBus } from "../systems/events.js";
import { AudioSystem } from "../systems/audio.js";
import {
  UILayer,
  Label,
  ResourceBar,
  Checkbox,
  Slider,
  Button,
} from "../ui/ui.js";
import { TooltipManager, Tooltip } from "../ui/tooltip.js";
import { DebugOverlay } from "../systems/debug.js";
import { AssetManager } from "../systems/assets.js";
import { pausedState, playState, menuState } from "../states/gameState.js";
import { StateManager } from "../systems/states.js";

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.collisions = new CollisionSystem();
    this.entities = new EntityRegistry();
    this.audio = new AudioSystem();
    this.inputs = new Inputs(inputBindings);
    this.events = new EventBus();
    this.tooltips = new TooltipManager();
    this.debugOverlay = new DebugOverlay(
      this.entities,
      this.collisions,
      this.inputs,
    );
    this.assetManager = new AssetManager();
    this.lastTime = null;
    this.animationFrameId = null;
    this.clientMouse = {
      position: { x: -10, y: -10 },
      lastClickPos: { x: -10, y: -10 },
    };

    // Game State
    this.gameState = new StateManager({
      paused: pausedState,
      menu: menuState,
      play: playState,
    });
    this.gameState.push(menuState);

    // Initial Setup
    this.canvas.width = gameSettings.width;
    this.canvas.height = gameSettings.height;

    this.audio.adjustVolume();
    this.inputs.setUpInputs();
    this.resizeCanvas();

    this.setUpEventListeners();
  }
  getScaledMousePos(e) {
    return {
      x: e.offsetX * (this.canvas.width / this.canvas.clientWidth),
      y: e.offsetY * (this.canvas.height / this.canvas.clientHeight),
    };
  }
  setUpEventListeners() {
    this.canvas.addEventListener("mousedown", (e) => {
      this.clientMouse.lastClickPos = this.getScaledMousePos(e);
      this.clientMouse.isDown = true;
    });
    this.canvas.addEventListener("mouseup", (e) => {
      this.clientMouse.isDown = false;
    });
    this.canvas.addEventListener("mousemove", (e) => {
      this.clientMouse.position = this.getScaledMousePos(e);
    });
    window.addEventListener("keydown", (e) => {
      if (!this.inputs.isDown("pause_game")) return;
      this.gameState.handleEvent("togglePause", this);
    });
    window.addEventListener("resize", () => {
      this.resizeCanvas();
      this.draw();
    });
  }
  resizeCanvas() {
    const ratio = gameSettings.ratio;
    let w, h;
    const margin = gameSettings.margin;

    const availableWidth = window.innerWidth - margin * 2;
    const availableHeight = window.innerHeight - margin * 2;

    if (availableWidth / availableHeight > ratio) {
      h = availableHeight;
      w = h * ratio;
    } else {
      w = availableWidth;
      h = w / ratio;
    }

    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";
    this.canvas.style.margin = margin + "px";
  }
  loadPlayState() {
    this.player = new Player(
      "player",
      20,
      20,
      40,
      100,
      40,
      100,
      4,
      300,
      this.collisions,
      this.inputs,
      this.events,
      "yellow",
    );
    this.collisions.register(this.player);
    this.entities.register(this.player);
  }
  loadMenuUI() {
    this.menuUI = new UILayer();

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
      this.events,
      "gameStarted",
      {
        btnBorderSize: "4px",
        btnBorderColor: "black",
      },
      {
        text: "Play Game",
      },
    );

    this.menuUI.register(title);
    this.menuUI.register(checkbox);
    this.menuUI.register(slider);
    this.menuUI.register(startGameBtn);

    this.events.on("gameStarted", (event) => {
      this.gameState.handleEvent(event, this);
    });
  }
  loadPauseUI() {
    this.pauseUI = new UILayer();

    const pauseText = new Label(
      gameSettings.width / 2,
      gameSettings.height / 2,
      {
        text: "Game Paused",
        align: "center",
        baseline: "middle",
      },
    );

    const menuBtnWidth = 200;
    const menuBtn = new Button(
      gameSettings.width / 2 + menuBtnWidth / 2,
      gameSettings.height / 2 + 100,
      menuBtnWidth,
      40,
      4,
      this.events,
      "gameMenu",
      {
        btnBorderColor: "black",
        btnBorderSize: "4px",
      },
      {
        text: "Quit to Menu",
      },
    );

    this.pauseUI.register(pauseText);
    this.pauseUI.register(menuBtn);

    this.events.on("gameMenu", (event) => {
      this.gameState.handleEvent(event, this);
      this.gameState.clear();
      this.gameState.push(menuState);
    });
  }
  loadPlayUI() {
    this.playUI = new UILayer();

    const playerHealthBar = new ResourceBar(
      20,
      gameSettings.height - 30 - 20,
      200,
      30,
      3,
    );

    this.tooltips.register(
      playerHealthBar,
      "This is a player's healthbar",
      this.gameState.states.play,
    );

    this.playUI.register(playerHealthBar);

    this.events.on("playerHealthChanged", ({ current, max }) =>
      playerHealthBar.setValue(current, max),
    );
  }
  async init() {
    // Load assets
    await Promise.all([]);

    // Game Systems
    this.loadPlayState();

    // User Interface
    this.loadPlayUI();
    this.loadPauseUI();
    this.loadMenuUI();
  }
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const state of this.gameState.stack) {
      state.draw(this);
    }

    // debug
    this.debugOverlay.drawScreenStats(this.ctx);
    // Tooltip
    this.tooltips.draw(this.ctx);
  }
  update(dt) {
    this.gameState.peek().update(dt, this);

    // Debug
    this.debugOverlay.update(dt, this.clientMouse);
    // Tooltip
    this.tooltips.update(dt, this.clientMouse, this.gameState.peek());
    // Reset Mouse Click Pos
    this.clientMouse.lastClickPos = { x: -10, y: -10 };
  }
  gameLoop() {
    const loop = (timestamp) => {
      if (this.lastTime === null) this.lastTime = timestamp;
      const dt = (timestamp - this.lastTime) / 1000;
      this.lastTime = timestamp;

      this.update(dt);
      this.draw();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }
  start() {
    this.init();
    this.gameLoop();
  }
  stop() {
    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
    this.lastTime = null;
  }
  restart() {
    this.stop();
    this.score = 0;
    this.entities = new EntityRegistry();
    this.collisions = new CollisionSystem();
    this.events = new EventBus();
    this.start();
  }
}

export { Game };
