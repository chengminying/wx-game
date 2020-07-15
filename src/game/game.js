import gameController from './controller';

class Game {
  constructor() {
    this.gameController = gameController;
  }

  init () {
    this.gameController.initPage();
  }
}

export default new Game();