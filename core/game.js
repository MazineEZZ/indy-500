import { gameSettings, inputBindings } from "../data/settings.js";
import { EntityRegistry } from "../systems/entities.js";
import { CollisionSystem } from "../systems/collisions.js";
import { Inputs } from "../systems/inputs.js";
import { EventBus } from "../systems/events.js";
import { AudioSystem } from "../systems/audio.js";
import { TooltipManager, Tooltip } from "../ui/tooltip.js";
import { DebugOverlay } from "../systems/debug.js";
import { AssetManager } from "../systems/assets.js";
import { pausedState, playState, menuState } from "../states/gameState.js";
import { StateManager } from "../systems/states.js";
import { ClientMouse } from "../systems/clientMouse.js";
import { setUpPlayState } from "../states/playState.js";
import { setUpMenuState } from "../states/menuState.js";
import { setUpPauseState } from "../states/pauseState.js";

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.collisions = new CollisionSystem();
    this.entities = new EntityRegistry();
    this.audio = new AudioSystem();
    this.events = new EventBus();
    this.tooltips = new TooltipManager();
    this.assetManager = new AssetManager();
    this.lastTime = null;
    this.animationFrameId = null;
    this.clientMouse = new ClientMouse(this.canvas);
    this.inputs = new Inputs(inputBindings);
    this.debugOverlay = new DebugOverlay(
      this.entities,
      this.collisions,
      this.inputs,
    );

    // Game State
    this.gameState = new StateManager(
      {
        paused: pausedState,
        menu: menuState,
        play: playState,
      },
      this.events,
    );

    // Initial Setup
    this.canvas.width = gameSettings.width;
    this.canvas.height = gameSettings.height;

    this.audio.adjustVolume();
    this.clientMouse.setUpMouseListeners();
    this.inputs.setUpInputs();
    this.resizeCanvas();

    this.setUpEventListeners();
  }
  setUpEventListeners() {
    window.addEventListener("keydown", (e) => {
      if (!this.inputs.isDownOnce("pause_game")) return;
      this.events.emit("togglePause");
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
  setUpSignals() {
    // Game Events
    this.events.on("stateChanged", () => {
      this.clientMouse.updateElements(
        this.gameState.peek().ui.elements,
        this.entities.elements,
      );
    });

    // State Management
    this.gameState.push(playState);
    this.events.emit("stateChanged");
  }
  async init() {
    // Load assets
    await Promise.all([]);

    // Game States
    this.playUI = setUpPlayState(
      this.gameState,
      this.entities,
      this.collisions,
      this.inputs,
      this.tooltips,
      this.events,
    );
    this.pauseUI = setUpPauseState(this.gameState, this.events);
    this.menuUI = setUpMenuState(this.gameState, this.events);

    this.setUpSignals();
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
    this.clientMouse.resetClick();
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
  async start() {
    await this.init();
    this.gameLoop();
  }
  stop() {
    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
    this.lastTime = null;
  }
}

export { Game };
