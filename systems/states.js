class State {
  constructor(transitions, { onEnter, onExit, update, draw, ui } = {}) {
    this.transitions = transitions;
    this.onEnter = onEnter || (() => {});
    this.onExit = onExit || (() => {});
    this.update = update || (() => {});
    this.draw = draw || (() => {});
    this.ui = ui || null;
  }
}

class StateManager {
  constructor(states) {
    this.states = states;
    this.stack = [];
  }
  push(state) {
    this.stack.push(state);
  }
  pop() {
    this.stack.pop();
  }
  peek() {
    return this.stack.at(-1);
  }
  clear() {
    this.stack.length = 0;
  }
  handleEvent(event, game) {
    if (this.peek() === undefined) {
      throw new Error("currentState must be specified!");
    }
    for (const trans of this.peek().transitions) {
      if (trans.event === event) {
        const state = this.states[trans.state];

        switch (trans.action) {
          case "push":
            this.push(state);
            this.peek().onEnter(game);
            break;
          case "pop":
            this.peek().onExit(game);
            this.pop();
            break;
          case "clear":
            for (let i = this.stack.length - 1; i >= 0; i--) {
              this.stack[i].onExit(game);
            }
            this.clear();
            this.push(state);
            this.peek().onEnter(game);
            break;
        }
        return "Transition Successful";
      }
    }
    console.warn("Not possible");
  }
}

export { State, StateManager };
