import Event from '../utils/events';

class GameModel {
  constructor() {
    this.stage = '';
    this.stageChanged = new Event(this);
  }

  getStage () {
    return this.stage;
  }

  setStage (stage) {
    this.stage = stage;
    this.stageChanged.trigger({
      stage: stage,
    })
  }
}

export default new GameModel();