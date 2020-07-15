import GamePage from '../pages/gamePage';
import GameOverPage from '../pages/gameOverPage';
import GameStartPage from '../pages/startPage';

class GameView {
  constructor() {

  }

  showGameOverPage () {
    this.gameOverPage.show();
  }

  showGamePage () {
    this.gameOverPage.hide();
    this.gameStartPage.hide();
    this.gamePage.restart();
    this.gamePage.show();
  }

  restartGame () {
    this.gamePage.restart();
  }

  initGameOverPage (callbacks) {
    this.gameOverPage = new GameOverPage(callbacks);
    this.gameOverPage.init({
      camera: this.gamePage.scene.camera,
    });
  }

  initGamePage (callbacks) {
    this.gamePage = new GamePage(callbacks);
    this.gamePage.init();
  }

  initStartPage (callbacks) {
    this.gameStartPage = new GameStartPage(callbacks);
    this.gameStartPage.init({
      camera: this.gamePage.scene.camera
    });
  }

}

export default new GameView();