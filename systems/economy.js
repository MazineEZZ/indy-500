class Economy {
  constructor(startingBlc, events) {
    this.events = events;
    this._balance = startingBlc;
  }
  spend(value) {
    if (this._balance < value) return false;
    this._balance -= value;
    this.events.emit("balanceUpdated", `$${this._balance}`);
    return true;
  }
  add(value) {
    this._balance += value;
    this.events.emit("balanceUpdated", `$${this._balance}`);
  }
  get balance() {
    return `$${this._balance}`;
  }
}

export { Economy };
