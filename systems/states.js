class State {
  constructor(transitions, { onEnter, onExit, update, draw } = {}) {
    this.transitions = transitions;
    this.onEnter = onEnter || (() => {});
    this.onExit = onExit || (() => {});
    this.update = update || (() => {});
    this.draw = draw || (() => {});
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
        // THere is a problem with the current implementation here
        // In some cases, it can push the state twice.
        this.peek().onExit(game);
        this.push(this.states[trans.state]);
        this.peek().onEnter(game);
        return "Transition Successful";
      }
    }
    console.warn("Not possible");
  }
}

export { State, StateManager };
