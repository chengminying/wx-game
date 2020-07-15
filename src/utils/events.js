class Event {
  constructor(sender) {
    this._sender = sender;
    this._listeners = [];
  }

  listen (callback) {
    this._listeners.push(callback);
  }

  trigger (args) {
    for(let i = 0; i < this._listeners.length; i++) {
      this._listeners[i](this._sender, args)
    }
  }
}

export default Event;