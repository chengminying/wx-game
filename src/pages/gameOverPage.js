import sceneConf from '../../conf/sceneConf';

export default class GameOverPage {
  constructor(callbacks) {
    this.callbacks = callbacks;
  }

  init (options) {
    this.initGameOverCanvas(options)
  }

  initGameOverCanvas(options) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    //game over 框可点击区域
    this.region = [
      (width - 200) / 2,
      (width - 200) / 2 + 200,
      (height - 100) / 2,
      (height - 100) / 2 + 100,
    ];

    const aspect =  height / width;
    const s = sceneConf.frustumSize;
    this.camera = options.camera.instance;
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.texture = new THREE.Texture(this.canvas);
    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      side: THREE.DoubleSide
    });
    this.geometry = new THREE.PlaneGeometry(s * 2, aspect * s * 2);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.z = 20;
    this.mesh.visible = false;
    this.context = this.canvas.getContext('2d');
    this.context.fillStyle = '#333';
    this.context.fillRect((width - 200) / 2, (height - 100) / 2, 200, 100);
    this.context.fillStyle = '#eee';
    this.context.font = '20px Georgia';
    this.context.fillText('Game Over', (width - 200) / 2 + 50, (height - 100) / 2 + 55);
    this.texture.needsUpdate = true;
    this.mesh.visible = false;
    this.camera.add(this.mesh);
  }

  onTouchEnd = e => {
    const pageX = e.changedTouches[0].pageX;
    const pageY = e.changedTouches[0].pageY;

    //判断点击的位置的x，y 在gameOver区域内
    const isIn = pageX > this.region[0]
                  && pageX < this.region[1]
                  && pageY > this.region[2]
                  && pageY < this.region[3];
    //重新开始游戏
    if(isIn) this.callbacks.gameRestart();
  }

  bindTouchEvent () {
    canvas.addEventListener('touchend', this.onTouchEnd);
  }

  removeTouchEvent () {
    canvas.removeEventListener('touchend', this.onTouchEnd);
  }

  show () {
    this.mesh.visible = true;
    this.bindTouchEvent();
  }

  hide () {
    this.mesh.visible = false;
    this.removeTouchEvent();
  }
}
