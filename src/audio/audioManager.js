import audioConf from '../../conf/audioConf';
import gameView from '../game/view';

class AudioManager {
  constructor () {

  }

  init () {
    const gamePage = gameView.gamePage;
    for (let key in audioConf) {
      this[key] = wx.createInnerAudioContext();
      this[key].src = audioConf[key];
    }
    if(this['scale_loop']) this['scale_loop'].loop = true;
    this['scale_intro'] && this['scale_intro'].onEnded(() => {
      if(gamePage.bottle.status === "shrink") {
        this['scale_loop'].play();
      }
    });
  }
}

export default new AudioManager();