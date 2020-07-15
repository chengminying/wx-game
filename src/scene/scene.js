import camera from './camera';
import lights from './lights';

class Scene {
  constructor() {
    this.instance = null;
    this.currentScore = null;
  }

  init () {
    this.instance = new THREE.Scene();
    this.instance.background = new THREE.Color(0xd7dbe6);
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      preserveDrawingBuffer: true //是否保留缓存直到手动清除或覆盖， 用来提升性能
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    //辅助线
    // this.axesHelper = new THREE.AxesHelper(100);
    // this.instance.add(this.axesHelper);

    //相机
    this.camera = camera;
    this.camera.init();
    this.instance.add(this.camera.instance);


    //光源
    this.lights = lights;
    this.lights.init();
    for(let i in this.lights.instance) {
      this.instance.add(this.lights.instance[i]);
    }
  }

  addScore (scoreMesh) {
    this.currentScore = scoreMesh;
    this.camera.instance.add(scoreMesh);
    scoreMesh.position.x = -20;
    scoreMesh.position.y = 40;
  }

  reset () {
    this.camera.reset();
    this.lights.reset();
  }

  updateCameraPosition (targetPosition) {
    this.camera.updatePosition(targetPosition);
    this.lights.updatePosition(targetPosition);
  }

  render = () => {
    this.renderer.render(this.instance, this.camera.instance);
  }
}

export default new Scene();
