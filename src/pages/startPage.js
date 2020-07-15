class GameStartPage {
  constructor (callbacks) {
    this.callbacks = callbacks;
  }

  init () {
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

  show () {

  }

  hide () {

  }
}