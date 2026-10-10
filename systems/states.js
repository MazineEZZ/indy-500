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
	}
	is(stateName) {
		return this.currentState === this.states[stateName];
	}
	setCurrentState(state) {
		this.currentState = state;
	}
	handleEvent(event, game) {
		if (this.currentState === undefined) {
			throw new Error("currentState must be specified!");
		}
		for (const trans of this.currentState.transitions) {
			if (trans.event === event) {
				this.currentState.onExit(game);
				this.currentState = this.states[trans.state];
				this.currentState.onEnter(game);
				return "Transition Successful";
			}
		}
		console.warn("Not possible");
	}
}

export { State, StateManager };
